import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { currentUser, defaultMetadata, fallbackResponse, initialDocuments, initialNotifications, mockResponses, suggestionsByCategory } from '../data/mockData'
import type { ChatItem, NotificationItem, PolicyDocument, ResponseMetadata, RetrievedDocument, Theme, User, View } from '../types'

const welcomeMessage: ChatItem = { id:1, role:'assistant', content:"Hello! I'm your AI HR Policy Assistant. Ask me anything about your company HR policies." }

interface AppContextValue {
  user: User; messages: ChatItem[]; documents: PolicyDocument[]; selectedCategory:string
  retrievedDocuments: RetrievedDocument[]; suggestions:string[]; confidence:number; metadata:ResponseMetadata|null
  theme:Theme; notifications:NotificationItem[]; sidebarOpen:boolean; loading:boolean; bookmarks:ChatItem[]
  recentQuestions:string[]; view:View; toast:string; selectedDocument:PolicyDocument|null
  setSelectedCategory:(category:string)=>void; setSidebarOpen:(open:boolean)=>void; setView:(view:View)=>void
  setSelectedDocument:(doc:PolicyDocument|null)=>void; showToast:(message:string)=>void; newChat:()=>void
  sendMessage:(question:string)=>void; clearChat:()=>void; addDocuments:(docs:PolicyDocument[])=>void
  removeDocument:(id:string)=>void; toggleTheme:()=>void; markNotificationsRead:()=>void
  updateMessage:(id:number,patch:Partial<ChatItem>)=>void; regenerate:(id:number)=>void; clearHistory:()=>void
}

const AppContext=createContext<AppContextValue|null>(null)
const readStorage=<T,>(key:string,fallback:T):T=>{try{const value=localStorage.getItem(key);return value?JSON.parse(value) as T:fallback}catch{return fallback}}
const readArray=<T,>(key:string,fallback:T[]):T[]=>{const value=readStorage<unknown>(key,fallback);return Array.isArray(value)?value as T[]:fallback}

export function AppProvider({children}:{children:ReactNode}){
  const [messages,setMessages]=useState<ChatItem[]>(()=>readArray('hr-chat',[welcomeMessage]))
  const [documents,setDocuments]=useState<PolicyDocument[]>(()=>readArray('hr-documents',initialDocuments))
  const [selectedCategory,setCategory]=useState('All Policies')
  const [retrievedDocuments,setRetrievedDocuments]=useState<RetrievedDocument[]>([])
  const [suggestions,setSuggestions]=useState(suggestionsByCategory['All Policies'])
  const [confidence,setConfidence]=useState(0)
  const [metadata,setMetadata]=useState<ResponseMetadata|null>(null)
  const [theme,setTheme]=useState<Theme>(()=>readStorage<unknown>('hr-theme','light')==='dark'?'dark':'light')
  const [notifications,setNotifications]=useState<NotificationItem[]>(initialNotifications)
  const [sidebarOpen,setSidebarOpen]=useState(()=>readStorage<unknown>('hr-sidebar',false)===true)
  const [loading,setLoading]=useState(false)
  const [bookmarks,setBookmarks]=useState<ChatItem[]>(()=>readArray('hr-bookmarks',[]))
  const [recentQuestions,setRecentQuestions]=useState<string[]>(()=>readArray('hr-recent',['How many casual leaves are allowed?','What is the work from home policy?','What is the notice period?','Can I carry forward earned leave?','How is PF calculated?']).filter(item=>typeof item==='string'))
  const [view,setView]=useState<View>('chat'); const [toast,setToast]=useState(''); const [selectedDocument,setSelectedDocument]=useState<PolicyDocument|null>(null)

  useEffect(()=>{document.documentElement.classList.toggle('dark',theme==='dark');localStorage.setItem('hr-theme',JSON.stringify(theme))},[theme])
  useEffect(()=>localStorage.setItem('hr-chat',JSON.stringify(messages)),[messages])
  useEffect(()=>localStorage.setItem('hr-documents',JSON.stringify(documents)),[documents])
  useEffect(()=>localStorage.setItem('hr-bookmarks',JSON.stringify(bookmarks)),[bookmarks])
  useEffect(()=>localStorage.setItem('hr-recent',JSON.stringify(recentQuestions)),[recentQuestions])
  useEffect(()=>localStorage.setItem('hr-sidebar',JSON.stringify(sidebarOpen)),[sidebarOpen])

  const showToast=useCallback((message:string)=>{setToast(message);window.setTimeout(()=>setToast(''),2500)},[])
  const setSelectedCategory=useCallback((category:string)=>{setCategory(category);setSuggestions(suggestionsByCategory[category]??suggestionsByCategory['All Policies']);setRetrievedDocuments(prev=>category==='All Policies'?prev:prev.filter(d=>d.category===category));showToast(`${category} policies selected`)},[showToast])
  const newChat=useCallback(()=>{setMessages([{...welcomeMessage,id:Date.now()}]);setRetrievedDocuments([]);setConfidence(0);setMetadata(null);setLoading(false);setView('chat');setSidebarOpen(false);showToast('New conversation started');window.scrollTo({top:0,behavior:'smooth'})},[showToast])
  const sendMessage=useCallback((question:string)=>{const trimmed=question.trim();if(!trimmed)return;const userMessage:ChatItem={id:Date.now(),role:'user',content:trimmed};setMessages(prev=>[...prev,userMessage]);setRecentQuestions(prev=>[trimmed,...prev.filter(q=>q!==trimmed)].slice(0,8));setLoading(true);setView('chat');window.setTimeout(()=>{const normalized=trimmed.toLowerCase();const response=mockResponses.find(item=>item.keywords.some(keyword=>normalized.includes(keyword)))??fallbackResponse;const assistant:ChatItem={id:Date.now()+1,role:'assistant',content:response.answer,detail:response.detail,source:response.documents[0]};setMessages(prev=>[...prev,assistant]);setRetrievedDocuments(response.documents);setConfidence(response.confidence);setSuggestions(response.suggestions);setMetadata({...defaultMetadata,chunksRetrieved:response.documents.length+3,latency:`${(1.05+Math.random()*.9).toFixed(2)} sec`,timestamp:new Date().toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'})});setLoading(false)},2000)},[])
  const clearChat=useCallback(()=>{setMessages([]);setRetrievedDocuments([]);setConfidence(0);setMetadata(null);setSuggestions(suggestionsByCategory[selectedCategory]??[]);showToast('Conversation cleared')},[selectedCategory,showToast])
  const addDocuments=useCallback((items:PolicyDocument[])=>{setDocuments(prev=>[...items,...prev]);setNotifications(prev=>[{id:`n-${Date.now()}`,title:'Document uploaded',description:`${items.length} document${items.length>1?'s':''} added to Policy Library`,time:'Just now',read:false,tone:'green'},...prev]);showToast(`${items.length} document${items.length>1?'s':''} uploaded successfully`)},[showToast])
  const removeDocument=useCallback((id:string)=>{setDocuments(prev=>prev.filter(d=>d.id!==id));showToast('Document removed')},[showToast])
  const toggleTheme=useCallback(()=>{setTheme(prev=>{const next=prev==='light'?'dark':'light';showToast(`${next==='dark'?'Dark':'Light'} theme enabled`);return next})},[showToast])
  const markNotificationsRead=useCallback(()=>setNotifications(prev=>prev.map(n=>({...n,read:true}))),[])
  const updateMessage=useCallback((id:number,patch:Partial<ChatItem>)=>{setMessages(prev=>prev.map(m=>m.id===id?{...m,...patch}:m));if('bookmarked' in patch){setBookmarks(prev=>patch.bookmarked?[...prev.filter(m=>m.id!==id),...messages.filter(m=>m.id===id).map(m=>({...m,...patch}))]:prev.filter(m=>m.id!==id))}},[messages])
  const regenerate=useCallback((id:number)=>{setLoading(true);window.setTimeout(()=>{setMessages(prev=>prev.map(m=>m.id===id?{...m,detail:'Here is an alternative summary: eligible employees should follow the approval workflow and confirm the latest limits in the cited policy document.'}:m));setLoading(false);showToast('Response regenerated')},1200)},[showToast])
  const clearHistory=useCallback(()=>{setRecentQuestions([]);showToast('Recent question history cleared')},[showToast])
  const value=useMemo(()=>({user:currentUser,messages,documents,selectedCategory,retrievedDocuments,suggestions,confidence,metadata,theme,notifications,sidebarOpen,loading,bookmarks,recentQuestions,view,toast,selectedDocument,setSelectedCategory,setSidebarOpen,setView,setSelectedDocument,showToast,newChat,sendMessage,clearChat,addDocuments,removeDocument,toggleTheme,markNotificationsRead,updateMessage,regenerate,clearHistory}),[messages,documents,selectedCategory,retrievedDocuments,suggestions,confidence,metadata,theme,notifications,sidebarOpen,loading,bookmarks,recentQuestions,view,toast,selectedDocument,setSelectedCategory,showToast,newChat,sendMessage,clearChat,addDocuments,removeDocument,toggleTheme,markNotificationsRead,updateMessage,regenerate,clearHistory])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(){const context=useContext(AppContext);if(!context)throw new Error('useApp must be used inside AppProvider');return context}
