import { BarChart3, Bookmark, FileUp, MessageSquarePlus, Settings, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import PolicyLibrary from './PolicyLibrary'
import RecentQuestions from './RecentQuestions'
import { Button } from './ui/Button'
import { cn } from '../utils/cn'

export default function Sidebar({ onClose, onUpload, onSettings, onDocuments, onBookmarks }: { onClose:()=>void;onUpload:()=>void;onSettings:()=>void;onDocuments:()=>void;onBookmarks:()=>void }) {
  const {sidebarOpen,newChat,setView,view,sendMessage,recentQuestions,clearHistory}=useApp()
  const nav=[{label:'New Chat',icon:MessageSquarePlus,onClick:newChat},{label:'Upload Documents',icon:FileUp,onClick:onUpload},{label:'Dashboard',icon:BarChart3,onClick:()=>setView('dashboard')},{label:'Bookmarks',icon:Bookmark,onClick:onBookmarks},{label:'Settings',icon:Settings,onClick:onSettings}]
  return <><div aria-hidden={!sidebarOpen} onClick={onClose} className={cn('fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm transition lg:hidden',sidebarOpen?'opacity-100':'pointer-events-none opacity-0')}/><motion.aside aria-label="Application sidebar" initial={{x:-18,opacity:0}} animate={{x:0,opacity:1}} transition={{duration:.3}} className={cn('fixed bottom-0 left-0 top-[70px] z-50 flex w-[250px] flex-col overflow-y-auto border-r border-slate-200 bg-white p-4 transition-transform duration-300 lg:static lg:translate-x-0',sidebarOpen?'translate-x-0':'-translate-x-full')}><div className="mb-2 flex items-center justify-between lg:hidden"><span className="font-bold">Menu</span><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu"><X size={18}/></Button></div><nav aria-label="Primary navigation" className="space-y-1">{nav.map(({label,icon:Icon,onClick},i)=>{const active=(label==='Dashboard'&&view==='dashboard')||(label==='New Chat'&&view==='chat');return <button key={label} aria-current={active?'page':undefined} onClick={()=>{onClick();if(i>0)onClose()}} className={cn('relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-300',active?'bg-blue-50 text-blue-700 before:absolute before:-left-4 before:h-6 before:w-1 before:rounded-r-full before:bg-blue-600':'text-slate-600 hover:translate-x-0.5 hover:bg-slate-50 hover:text-slate-900')}><Icon size={17}/>{label}</button>})}</nav><PolicyLibrary onViewAll={onDocuments}/><RecentQuestions questions={recentQuestions} onSelect={q=>{sendMessage(q);onClose()}} onClear={clearHistory}/></motion.aside></>
}
