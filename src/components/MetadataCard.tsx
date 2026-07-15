import { Activity } from 'lucide-react'
import { Card } from './ui/Card'

const items=[['Embedding Model','all-MiniLM-L6-v2'],['LLM Model','GPT-4o-mini'],['Chunks Retrieved','5'],['Response Time','1.24 sec'],['Timestamp','Jul 15, 2025 · 10:30 AM']]
export default function MetadataCard(){return <Card className="p-4"><div className="flex items-center gap-2"><Activity size={16} className="text-blue-600"/><h3 className="text-sm font-bold">Response Metadata</h3></div><dl className="mt-3 space-y-2.5">{items.map(([k,v])=><div key={k} className="flex items-start justify-between gap-3"><dt className="text-[10px] text-slate-500">{k}</dt><dd className="text-right text-[10px] font-semibold text-slate-700">{v}</dd></div>)}</dl></Card>}
