import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import CategoryPanel from '../components/CategoryPanel'
import ChatArea from '../components/ChatArea'
import InformationPanel from '../components/InformationPanel'
import Sidebar from '../components/Sidebar'
import { Modal } from '../components/ui/Modal'
import MainLayout from '../layouts/MainLayout'
import { policyDocuments } from '../components/PolicyLibrary'
import { FileText } from 'lucide-react'
import type { ChatItem } from '../types'

const initialMessages:ChatItem[]=[{id:1,role:'user',content:'How many casual leaves are allowed?'},{id:2,role:'assistant',content:'According to the Leave Policy, employees are eligible for 12 Casual Leaves every calendar year.',detail:'These leaves cannot be encashed but can be carried forward up to 2 leaves to the next year.'}]
export default function Dashboard(){
  const [sidebar,setSidebar]=useState(false),[category,setCategory]=useState('All Policies'),[messages,setMessages]=useState<ChatItem[]>(initialMessages),[loading,setLoading]=useState(false),[docsOpen,setDocsOpen]=useState(false),[toast,setToast]=useState('');const timer=useRef<number>()
  useEffect(()=>()=>window.clearTimeout(timer.current),[])
  const showToast=(value:string)=>{setToast(value);window.clearTimeout(timer.current);timer.current=window.setTimeout(()=>setToast(''),2400)}
  const send=(question:string)=>{setMessages(v=>[...v,{id:Date.now(),role:'user',content:question}]);setLoading(true);window.setTimeout(()=>{setMessages(v=>[...v,{id:Date.now()+1,role:'assistant',content:'Based on the relevant HR policy, this request is covered under the standard employee guidelines.',detail:'For this demo, the response uses realistic static policy data. Please review the cited document before making a final decision.'}]);setLoading(false)},900)}
  return <MainLayout onMenu={()=>setSidebar(true)}><motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.3}} className="flex min-w-0 flex-1"><Sidebar open={sidebar} onClose={()=>setSidebar(false)} onQuestion={q=>{send(q);setSidebar(false)}} onNewChat={()=>{setMessages([]);setSidebar(false)}} onDocuments={()=>setDocsOpen(true)} onClearHistory={()=>showToast('Recent question history cleared')}/><CategoryPanel active={category} onChange={setCategory}/><ChatArea messages={messages} loading={loading} onSend={send} onClear={()=>setMessages([])} onToast={showToast}/><InformationPanel onDocuments={()=>setDocsOpen(true)} onToast={showToast}/></motion.div><Modal open={docsOpen} onClose={()=>setDocsOpen(false)} title="Policy Library"><div className="space-y-2">{policyDocuments.map((name,i)=><button key={name} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"><span className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-500"><FileText size={17}/></span><div><p className="text-sm font-semibold">{name}</p><p className="text-[10px] text-slate-500">PDF · Updated {i+2} days ago</p></div></button>)}</div></Modal><AnimatePresence>{toast&&<motion.div role="status" initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl">{toast}</motion.div>}</AnimatePresence></MainLayout>}
