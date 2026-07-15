import { Bot, Eraser, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ChatItem } from '../types'
import AIMessage from './AIMessage'
import ChatInput from './ChatInput'
import SuggestedQuestions from './SuggestedQuestions'
import UserMessage from './UserMessage'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { SkeletonLoader } from './ui/SkeletonLoader'

export default function ChatArea({ messages, loading, onSend, onClear, onToast }: { messages:ChatItem[]; loading:boolean; onSend:(q:string)=>void; onClear:()=>void; onToast:(s:string)=>void }) {
  return <section className="flex min-w-0 flex-1 flex-col bg-[#f8fafc]"><div className="flex h-[68px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-[13px] bg-blue-50 text-blue-600"><Bot size={21}/></div><div><div className="flex items-center gap-2"><h2 className="text-sm font-bold text-slate-900">AI HR Assistant</h2><Badge><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/> Online</Badge></div><p className="mt-0.5 hidden text-[10px] text-slate-500 sm:block">Powered by your company policy library</p></div></div><Button variant="ghost" size="sm" onClick={onClear}><Eraser size={15}/> <span className="hidden sm:inline">Clear chat</span></Button></div><div className="chat-scroll flex-1 overflow-y-auto px-4 py-6 sm:px-6"><div className="mx-auto flex max-w-4xl flex-col gap-5"><AnimatePresence initial={false}>{messages.map(m=>m.role==='user'?<UserMessage key={m.id}>{m.content}</UserMessage>:<AIMessage key={m.id} content={m.content} detail={m.detail} onToast={onToast}/>)}</AnimatePresence>{loading && <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="flex max-w-2xl items-start gap-3 text-xs text-slate-500"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-600 text-white"><Sparkles size={15}/></div><div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center gap-2"><div className="flex gap-1"><i className="typing-dot"/><i className="typing-dot [animation-delay:150ms]"/><i className="typing-dot [animation-delay:300ms]"/></div><span>Reviewing your policies…</span></div><SkeletonLoader/></div></motion.div>}{messages.length>0&&!loading&&<SuggestedQuestions onSelect={onSend}/>}</div></div><ChatInput onSend={onSend}/></section>
}
