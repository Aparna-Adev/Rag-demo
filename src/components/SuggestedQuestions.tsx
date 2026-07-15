import { ArrowUpRight } from 'lucide-react'

const suggestions=['Can CL be carried forward?','How many Sick Leaves?','How to apply for leave?','Leave during probation?']
export default function SuggestedQuestions({ onSelect }: { onSelect:(q:string)=>void }) {
  return <div className="max-w-3xl sm:pl-12"><p className="mb-3 text-xs font-semibold text-slate-500">You may also ask</p><div className="flex flex-wrap gap-2">{suggestions.map(q=><button key={q} onClick={()=>onSelect(q)} className="group inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3.5 py-2 text-xs font-medium text-blue-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm">{q}<ArrowUpRight size={12} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></button>)}</div></div>
}
