import { Clock3, Trash2 } from 'lucide-react'
import { Button } from './ui/Button'

const questions = ['How many casual leaves are allowed?','What is the work from home policy?','What is the notice period?','Can I carry forward earned leave?','How is PF calculated?']
export default function RecentQuestions({ onSelect, onClear }: { onSelect: (q: string) => void; onClear: () => void }) {
  return <section className="mt-6"><h2 className="section-label">Recent Questions</h2><div className="mt-2 space-y-0.5">{questions.map(q => <button key={q} onClick={() => onSelect(q)} className="group flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left text-[11px] leading-4 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"><Clock3 size={13} className="mt-0.5 shrink-0 text-slate-400 group-hover:text-blue-500" /><span className="line-clamp-2">{q}</span></button>)}</div><Button variant="danger" size="sm" className="mt-3 w-full justify-start text-xs" onClick={onClear}><Trash2 size={14} /> Clear history</Button></section>
}
