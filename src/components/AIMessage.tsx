import { Bookmark, Check, Copy, FileText, RefreshCw, Share2, ThumbsDown, ThumbsUp } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { ChatItem } from '../types'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Tooltip } from './ui/Tooltip'

export default function AIMessage({ message }: { message:ChatItem }) {
  const {showToast,updateMessage,regenerate,documents,setSelectedDocument}=useApp();const [copied,setCopied]=useState(false);const [feedback,setFeedback]=useState(false)
  const copy=async()=>{await navigator.clipboard?.writeText(`${message.content} ${message.detail??''}`);setCopied(true);showToast('Copied successfully');setTimeout(()=>setCopied(false),1500)}
  const like=()=>{updateMessage(message.id,{liked:!message.liked,disliked:false});showToast(message.liked?'Like removed':'Response liked')}
  const dislike=()=>{updateMessage(message.id,{disliked:!message.disliked,liked:false});setFeedback(!message.disliked);showToast(message.disliked?'Dislike removed':'Tell us what went wrong')}
  const bookmark=()=>{updateMessage(message.id,{bookmarked:!message.bookmarked});showToast(message.bookmarked?'Bookmark removed':'Response bookmarked')}
  const share=async()=>{if(navigator.share){try{await navigator.share({title:'HR Policy Answer',text:`${message.content}\n${message.detail??''}`})}catch{return}}else{await navigator.clipboard?.writeText(message.content)}showToast('Share link copied')}
  const openSource=()=>{const doc=documents.find(d=>d.id===message.source?.id);if(doc)setSelectedDocument(doc)}
  return <motion.div layout initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.3}} className="flex max-w-3xl gap-3"><div className="mt-1 hidden h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white sm:grid">AI</div><Card className="min-w-0 flex-1 overflow-hidden"><motion.div key={message.detail} initial={{opacity:0}} animate={{opacity:1}} className="p-5 sm:p-6"><p className="text-sm font-semibold leading-6 text-slate-900">{message.content}</p>{message.detail&&<p className="mt-3 text-sm leading-6 text-slate-600">{message.detail}</p>}{message.source&&<button onClick={openSource} className="mt-5 flex w-full items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/80 p-3.5 text-left transition hover:border-blue-300 hover:bg-blue-100/70"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-blue-600 shadow-sm"><FileText size={16}/></span><div className="min-w-0"><p className="truncate text-xs font-semibold text-blue-800">{message.source.name}</p><p className="text-[10px] text-blue-600">Page {message.source.page} · {message.source.section}</p></div><span className="ml-auto rounded-full bg-white px-2 py-1 text-[10px] font-bold text-blue-700">{message.source.score}%</span></button>}<AnimatePresence>{feedback&&<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="mt-4 overflow-hidden"><div className="rounded-xl bg-red-50 p-3"><p className="text-[11px] font-semibold text-red-800">What could be improved?</p><div className="mt-2 flex flex-wrap gap-1.5">{['Incorrect','Unclear','Missing source','Not relevant'].map(tag=><button key={tag} onClick={()=>{setFeedback(false);showToast('Thanks for your feedback')}} className="rounded-full border border-red-200 bg-white px-2.5 py-1 text-[10px] text-red-700 hover:bg-red-100">{tag}</button>)}</div></div></motion.div>}</AnimatePresence></motion.div><div className="flex items-center border-t border-slate-100 px-4 py-2"><time className="text-[10px] text-slate-400">{new Date(message.id).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</time><div className="ml-auto flex gap-0.5">{[
    {label:'Copy answer',icon:copied?<Check size={14} className="text-emerald-600"/>:<Copy size={14}/>,action:copy,active:false},
    {label:'Helpful',icon:<ThumbsUp size={14}/>,action:like,active:message.liked},
    {label:'Not helpful',icon:<ThumbsDown size={14}/>,action:dislike,active:message.disliked},
    {label:'Regenerate',icon:<RefreshCw size={14}/>,action:()=>regenerate(message.id),active:false},
    {label:'Share',icon:<Share2 size={14}/>,action:share,active:false},
    {label:'Bookmark',icon:<Bookmark size={14} fill={message.bookmarked?'currentColor':'none'}/>,action:bookmark,active:message.bookmarked},
  ].map(item=><Tooltip label={item.label} key={item.label}><Button variant="ghost" size="icon" className={`h-8 w-8 ${item.active?'bg-blue-50 text-blue-600':''}`} onClick={item.action} aria-label={item.label}>{item.icon}</Button></Tooltip>)}</div></div></Card></motion.div>
}
