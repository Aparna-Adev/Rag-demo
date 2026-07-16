import type { LucideIcon } from 'lucide-react'

export type Theme = 'light' | 'dark'
export type View = 'chat' | 'dashboard'
export type Category = { label: string; icon: LucideIcon }

export interface User {
  id: string
  name: string
  role: string
  initials: string
}

export interface PolicyDocument {
  id: string
  name: string
  type: 'PDF' | 'DOCX' | 'TXT'
  size: string
  chunks: number
  category: string
  updatedAt: string
  uploaded?: boolean
}

export interface RetrievedDocument {
  id: string
  name: string
  section: string
  score: number
  category: string
}

export interface ResponseMetadata {
  embeddingModel: string
  llmModel: string
  chunksRetrieved: number
  latency: string
  timestamp: string
}

export interface ChatItem {
  id: number
  role: 'user' | 'assistant'
  content: string
  detail?: string
  source?: RetrievedDocument
  liked?: boolean
  disliked?: boolean
  bookmarked?: boolean
}

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  tone: 'blue' | 'green' | 'purple'
}

