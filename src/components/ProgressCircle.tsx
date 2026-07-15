import { motion } from 'framer-motion'

export default function ProgressCircle({ value }: { value: number }) {
  const radius = 48, circumference = 2 * Math.PI * radius
  return <div className="relative grid h-32 w-32 place-items-center"><svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120" aria-label={`${value}% confidence`}><circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="9" /><motion.circle cx="60" cy="60" r={radius} fill="none" stroke="#22c55e" strokeWidth="9" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: circumference * (1 - value / 100) }} transition={{ duration: 1, ease: 'easeOut' }} /></svg><span className="absolute text-2xl font-bold text-slate-900">{value}%</span></div>
}
