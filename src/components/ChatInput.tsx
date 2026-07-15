import { Mic, Paperclip, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Button } from './ui/Button'
import { Tooltip } from './ui/Tooltip'

type FormValues={question:string}
export default function ChatInput({ onSend }: { onSend:(q:string)=>void }) {
  const { register,handleSubmit,reset,watch }=useForm<FormValues>({defaultValues:{question:''}})
  const submit=({question}:FormValues)=>{if(!question.trim())return;onSend(question.trim());reset()}
  return <form onSubmit={handleSubmit(submit)} className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6"><motion.div whileFocus={{ scale:1.002 }} className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_8px_30px_rgba(15,23,42,.08)] transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50"><textarea {...register('question')} rows={1} className="max-h-32 min-h-12 w-full resize-none bg-transparent px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400" placeholder="Ask a question about HR policies..." aria-label="Question" onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSubmit(submit)()}}}/><div className="flex items-center"><Tooltip label="Attach a document"><Button type="button" variant="ghost" size="icon" className="h-9 w-9" aria-label="Attach document"><Paperclip size={17}/></Button></Tooltip><Tooltip label="Use voice input"><Button type="button" variant="ghost" size="icon" className="h-9 w-9" aria-label="Voice input"><Mic size={17}/></Button></Tooltip><Button type="submit" size="sm" className="ml-auto h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 shadow-lg shadow-blue-100" disabled={!watch('question').trim()}>Send <Send size={15}/></Button></div></motion.div><p className="mt-2.5 text-center text-[10px] text-slate-400">AI can make mistakes. Please verify important information.</p></form>
}
