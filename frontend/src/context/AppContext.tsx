import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ChatItem, NotificationItem, PolicyDocument, ResponseMetadata, RetrievedDocument, Theme, User, View } from '../types'
import { ApiError, deleteDocument, listDocuments, sendChatMessage, uploadDocument, type ChatSource, type DocumentRecord, type UploadResponse } from '../services/api'

const welcomeMessage: ChatItem = {
  id: Date.now(),
  role: 'assistant',
  content: 'Hello. Upload a TXT, PDF, or DOCX document, then ask a question about your own indexed content.',
}

const defaultSuggestions = [
  'What is this document about?',
  'Summarize the uploaded document.',
  'What are the key facts in my document?',
]

interface AppContextValue {
  user: User
  messages: ChatItem[]
  documents: PolicyDocument[]
  selectedCategory: string
  retrievedDocuments: RetrievedDocument[]
  suggestions: string[]
  confidence: number
  metadata: ResponseMetadata | null
  theme: Theme
  notifications: NotificationItem[]
  sidebarOpen: boolean
  loading: boolean
  bookmarks: ChatItem[]
  recentQuestions: string[]
  view: View
  toast: string
  selectedDocument: PolicyDocument | null
  setSelectedCategory: (category: string) => void
  setSidebarOpen: (open: boolean) => void
  setView: (view: View) => void
  setSelectedDocument: (doc: PolicyDocument | null) => void
  showToast: (message: string) => void
  newChat: () => void
  sendMessage: (question: string) => Promise<void>
  clearChat: () => void
  uploadDocuments: (files: File[]) => Promise<UploadResponse[]>
  removeDocument: (id: string) => Promise<void>
  toggleTheme: () => void
  markNotificationsRead: () => void
  updateMessage: (id: number, patch: Partial<ChatItem>) => void
  regenerate: (id: number) => void
  clearHistory: () => void
  logout: () => void
}

interface AppProviderProps {
  children: ReactNode
  userEmail: string
  onLogout: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

function readTheme(): Theme {
  try {
    return localStorage.getItem('rag-theme') === '"dark"' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

function initialsFromEmail(email: string) {
  return email.slice(0, 2).toUpperCase()
}

function documentType(filename: string): PolicyDocument['type'] {
  const extension = filename.split('.').pop()?.toUpperCase()
  return extension === 'PDF' || extension === 'DOCX' || extension === 'TXT' ? extension : 'TXT'
}

function formatDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString()
}

function mapDocument(row: DocumentRecord): PolicyDocument {
  return {
    id: String(row.id),
    name: row.filename,
    type: documentType(row.filename),
    size: `${row.chunk_count} chunk${row.chunk_count === 1 ? '' : 's'}`,
    chunks: row.chunk_count,
    category: 'Uploaded Documents',
    updatedAt: formatDate(row.created_at),
    uploaded: true,
  }
}

function sourceScore(source: ChatSource) {
  const score = source.score <= 1 ? source.score * 100 : source.score
  return Math.max(0, Math.min(100, Math.round(score)))
}

function mapSource(source: ChatSource, index: number): RetrievedDocument {
  return {
    id: source.filename,
    name: source.filename,
    section: `Retrieved source ${index + 1}`,
    score: sourceScore(source),
    category: 'Uploaded Documents',
  }
}

function apiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Your session expired. Please sign in again.'
    if (error.status === 429) return 'Request limit reached. Please wait and try again.'
    return error.message || fallback
  }

  return fallback
}

export function AppProvider({ children, userEmail, onLogout }: AppProviderProps) {
  const [messages, setMessages] = useState<ChatItem[]>([welcomeMessage])
  const [documents, setDocuments] = useState<PolicyDocument[]>([])
  const [selectedCategory, setCategory] = useState('All Documents')
  const [retrievedDocuments, setRetrievedDocuments] = useState<RetrievedDocument[]>([])
  const [suggestions, setSuggestions] = useState(defaultSuggestions)
  const [confidence, setConfidence] = useState(0)
  const [metadata, setMetadata] = useState<ResponseMetadata | null>(null)
  const [theme, setTheme] = useState<Theme>(readTheme)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookmarks, setBookmarks] = useState<ChatItem[]>([])
  const [recentQuestions, setRecentQuestions] = useState<string[]>([])
  const [view, setView] = useState<View>('chat')
  const [toast, setToast] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<PolicyDocument | null>(null)

  const user = useMemo<User>(() => ({
    id: userEmail,
    name: userEmail,
    role: 'Authenticated user',
    initials: initialsFromEmail(userEmail),
  }), [userEmail])

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3000)
  }, [])

  const logout = useCallback(() => {
    setMessages([])
    setDocuments([])
    setRetrievedDocuments([])
    setBookmarks([])
    setRecentQuestions([])
    onLogout()
  }, [onLogout])

  const refreshDocuments = useCallback(async () => {
    try {
      const result = await listDocuments()
      setDocuments(result.documents.map(mapDocument))
    } catch (error) {
      showToast(apiErrorMessage(error, 'Unable to load documents.'))
      if (error instanceof ApiError && error.status === 401) logout()
    }
  }, [logout, showToast])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('rag-theme', JSON.stringify(theme))
  }, [theme])

  useEffect(() => {
    void refreshDocuments()
  }, [refreshDocuments])

  const setSelectedCategory = useCallback((category: string) => {
    setCategory(category)
    setSuggestions(defaultSuggestions)
  }, [])

  const newChat = useCallback(() => {
    setMessages([{ ...welcomeMessage, id: Date.now() }])
    setRetrievedDocuments([])
    setConfidence(0)
    setMetadata(null)
    setLoading(false)
    setView('chat')
    setSidebarOpen(false)
    showToast('New conversation started')
  }, [showToast])

  const sendMessage = useCallback(async (question: string) => {
    const trimmed = question.trim()
    if (!trimmed || loading) return

    const started = performance.now()
    const userMessage: ChatItem = { id: Date.now(), role: 'user', content: trimmed }
    setMessages(previous => [...previous, userMessage])
    setRecentQuestions(previous => [trimmed, ...previous.filter(item => item !== trimmed)].slice(0, 8))
    setLoading(true)
    setView('chat')

    try {
      const response = await sendChatMessage(trimmed)
      const sources = response.sources.map(mapSource)
      const averageScore = sources.length
        ? Math.round(sources.reduce((total, source) => total + source.score, 0) / sources.length)
        : 0

      setRetrievedDocuments(sources)
      setConfidence(averageScore)
      setMetadata({
        embeddingModel: 'Backend embedding service',
        llmModel: 'Configured Groq model',
        chunksRetrieved: sources.length,
        latency: `${((performance.now() - started) / 1000).toFixed(2)} sec`,
        timestamp: new Date().toLocaleString(),
      })
      setMessages(previous => [
        ...previous,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.answer,
          source: sources[0],
        },
      ])
    } catch (error) {
      const message = apiErrorMessage(error, 'Unable to answer right now. Please try again.')
      setMessages(previous => [...previous, { id: Date.now() + 1, role: 'assistant', content: message }])
      showToast(message)
      if (error instanceof ApiError && error.status === 401) logout()
    } finally {
      setLoading(false)
    }
  }, [loading, logout, showToast])

  const clearChat = useCallback(() => {
    setMessages([])
    setRetrievedDocuments([])
    setConfidence(0)
    setMetadata(null)
    setSuggestions(defaultSuggestions)
    showToast('Conversation cleared')
  }, [showToast])

  const uploadDocuments = useCallback(async (files: File[]) => {
    const results: UploadResponse[] = []

    for (const file of files) {
      results.push(await uploadDocument(file))
    }

    await refreshDocuments()
    setNotifications(previous => [{
      id: `n-${Date.now()}`,
      title: 'Document uploaded',
      description: `${results.length} document${results.length === 1 ? '' : 's'} indexed successfully`,
      time: 'Just now',
      read: false,
      tone: 'green',
    }, ...previous])
    showToast(`${results.length} document${results.length === 1 ? '' : 's'} uploaded successfully`)

    return results
  }, [refreshDocuments, showToast])

  const removeDocument = useCallback(async (id: string) => {
    try {
      const result = await deleteDocument(id)
      setDocuments(previous => previous.filter(document => document.id !== id))
      setRetrievedDocuments(previous => previous.filter(document => document.id !== id))
      showToast(result.file_note)
    } catch (error) {
      const message = apiErrorMessage(error, 'Unable to delete document.')
      showToast(message)
      if (error instanceof ApiError && error.status === 401) logout()
      throw error
    }
  }, [logout, showToast])

  const toggleTheme = useCallback(() => {
    setTheme(previous => {
      const next = previous === 'light' ? 'dark' : 'light'
      showToast(`${next === 'dark' ? 'Dark' : 'Light'} theme enabled`)
      return next
    })
  }, [showToast])

  const markNotificationsRead = useCallback(() => {
    setNotifications(previous => previous.map(notification => ({ ...notification, read: true })))
  }, [])

  const updateMessage = useCallback((id: number, patch: Partial<ChatItem>) => {
    setMessages(previous => previous.map(message => (message.id === id ? { ...message, ...patch } : message)))
    if ('bookmarked' in patch) {
      setBookmarks(previous => {
        const current = messages.find(message => message.id === id)
        if (!current || !patch.bookmarked) return previous.filter(message => message.id !== id)
        return [{ ...current, ...patch }, ...previous.filter(message => message.id !== id)]
      })
    }
  }, [messages])

  const regenerate = useCallback(() => {
    showToast('Ask the question again to generate a fresh answer.')
  }, [showToast])

  const clearHistory = useCallback(() => {
    setRecentQuestions([])
    showToast('Recent question history cleared')
  }, [showToast])

  const value = useMemo(() => ({
    user,
    messages,
    documents,
    selectedCategory,
    retrievedDocuments,
    suggestions,
    confidence,
    metadata,
    theme,
    notifications,
    sidebarOpen,
    loading,
    bookmarks,
    recentQuestions,
    view,
    toast,
    selectedDocument,
    setSelectedCategory,
    setSidebarOpen,
    setView,
    setSelectedDocument,
    showToast,
    newChat,
    sendMessage,
    clearChat,
    uploadDocuments,
    removeDocument,
    toggleTheme,
    markNotificationsRead,
    updateMessage,
    regenerate,
    clearHistory,
    logout,
  }), [bookmarks, clearChat, clearHistory, confidence, documents, loading, logout, markNotificationsRead, messages, metadata, newChat, notifications, recentQuestions, regenerate, removeDocument, retrievedDocuments, selectedCategory, selectedDocument, sendMessage, showToast, sidebarOpen, suggestions, theme, toggleTheme, updateMessage, uploadDocuments, user, view, toast])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
