import { FileText } from 'lucide-react'
import { Button } from './ui/Button'

export const policyDocuments = ['HR Policy.pdf','Leave Policy.pdf','Attendance Policy.pdf','Travel Policy.pdf','Code of Conduct.pdf','ISMS Policy.pdf']
export default function PolicyLibrary({ onViewAll }: { onViewAll: () => void }) {
  return <section className="mt-6"><h2 className="section-label">Policy Library</h2><div className="mt-2 space-y-0.5">{policyDocuments.map((name, index) => <button key={name} className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[12px] font-medium text-slate-600 transition duration-300 hover:bg-blue-50 hover:text-blue-700"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-red-50 text-red-500 transition group-hover:scale-105"><FileText size={14} /></span><span className="truncate">{name}</span>{index === 1 && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-500" />}</button>)}</div><Button variant="secondary" size="sm" className="mt-3 w-full text-xs" onClick={onViewAll}>View all documents</Button></section>
}
