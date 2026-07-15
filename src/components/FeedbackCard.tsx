import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

export default function FeedbackCard(){const {showToast}=useApp();const [choice,setChoice]=useState<string>();const choose=(v:string)=>{setChoice(v);showToast('Thanks for your feedback')};return <Card className="p-4"><h3 className="text-sm font-bold">Was this answer helpful?</h3><p className="mt-1 text-[10px] text-slate-500">Your feedback improves future answers.</p><div className="mt-3 grid grid-cols-2 gap-2"><Button variant="secondary" size="sm" onClick={()=>choose('yes')} className={choice==='yes'?'border-emerald-300 bg-emerald-50 text-emerald-700':''}><ThumbsUp size={14}/> Yes</Button><Button variant="secondary" size="sm" onClick={()=>choose('no')} className={choice==='no'?'border-red-300 bg-red-50 text-red-600':''}><ThumbsDown size={14}/> No</Button></div></Card>}
