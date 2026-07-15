import { BarChart3, FileUp, MessageSquarePlus, Settings, X } from 'lucide-react'
import { motion } from 'framer-motion'
import PolicyLibrary from './PolicyLibrary'
import RecentQuestions from './RecentQuestions'
import { Button } from './ui/Button'
import { cn } from '../utils/cn'

const nav = [{ label:'New Chat',icon:MessageSquarePlus },{ label:'Upload Documents',icon:FileUp },{ label:'Dashboard',icon:BarChart3 },{ label:'Settings',icon:Settings }]
export default function Sidebar({ open, onClose, onQuestion, onNewChat, onDocuments, onClearHistory }: { open:boolean; onClose:()=>void; onQuestion:(q:string)=>void; onNewChat:()=>void; onDocuments:()=>void; onClearHistory:()=>void }) {
  return <><div aria-hidden={!open} onClick={onClose} className={cn('fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm transition lg:hidden', open ? 'opacity-100' : 'pointer-events-none opacity-0')} /><motion.aside aria-label="Application sidebar" initial={{ x: -18, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration:.3 }} className={cn('fixed bottom-0 left-0 top-[70px] z-50 flex w-[250px] flex-col overflow-y-auto border-r border-slate-200 bg-white p-4 transition-transform duration-300 lg:static lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}><div className="mb-2 flex items-center justify-between lg:hidden"><span className="font-bold">Menu</span><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu"><X size={18} /></Button></div><nav aria-label="Primary navigation" className="space-y-1">{nav.map(({label,icon:Icon},i)=><button key={label} aria-current={i===0?'page':undefined} onClick={i===0?onNewChat:undefined} className={cn('relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-300', i===0?'bg-blue-50 text-blue-700 before:absolute before:-left-4 before:h-6 before:w-1 before:rounded-r-full before:bg-blue-600':'text-slate-600 hover:translate-x-0.5 hover:bg-slate-50 hover:text-slate-900')}><Icon size={17} />{label}</button>)}</nav><PolicyLibrary onViewAll={onDocuments} /><RecentQuestions onSelect={onQuestion} onClear={onClearHistory} /></motion.aside></>
}
