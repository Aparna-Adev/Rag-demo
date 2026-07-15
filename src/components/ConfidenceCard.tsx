import { ShieldCheck } from 'lucide-react'
import { Card } from './ui/Card'
import ProgressCircle from './ProgressCircle'

export default function ConfidenceCard(){return <Card className="flex flex-col items-center p-5 text-center"><div className="mb-1 flex w-full items-center gap-2"><ShieldCheck size={16} className="text-emerald-600"/><h3 className="text-sm font-bold">Confidence Score</h3></div><ProgressCircle value={96}/><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">High Confidence</span><p className="mt-2 text-[10px] leading-4 text-slate-500">This answer is highly relevant based on retrieved documents.</p></Card>}
