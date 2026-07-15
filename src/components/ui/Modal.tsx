import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { Button } from './Button'
import type { ReactNode } from 'react'

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[open,onClose])
  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}><motion.div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }} transition={{ duration: .3 }} onMouseDown={e => e.stopPropagation()}><div className="flex items-center justify-between"><h2 id="modal-title" className="text-lg font-bold">{title}</h2><Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog"><X size={18} /></Button></div><div className="mt-5">{children}</div></motion.div></motion.div>}</AnimatePresence>
}
