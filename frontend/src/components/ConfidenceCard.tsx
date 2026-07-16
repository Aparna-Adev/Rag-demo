import { ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Card } from './ui/Card'
import ProgressCircle from './ProgressCircle'

export default function ConfidenceCard(){const {confidence}=useApp();const tone=confidence>=90?['High Source Score','bg-emerald-50 text-emerald-700','text-emerald-600']:confidence>=70?['Moderate Source Score','bg-amber-50 text-amber-700','text-amber-600']:['Low Source Score','bg-red-50 text-red-700','text-red-600'];return <Card className="flex flex-col items-center p-5 text-center"><div className="mb-1 flex w-full items-center gap-2"><ShieldCheck size={16} className={tone[2]}/><h3 className="text-sm font-bold">Source Score</h3></div><ProgressCircle value={confidence}/><span className={`rounded-full px-3 py-1 text-[10px] font-bold ${tone[1]}`}>{confidence? tone[0]:'Awaiting Answer'}</span><p className="mt-2 text-[10px] leading-4 text-slate-500">{confidence?'Average similarity score from returned sources.':'Ask a question to retrieve sources.'}</p></Card>}
