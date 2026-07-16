import { FileText, Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { Button } from './ui/Button'

export default function SourcesDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { retrievedDocuments, documents, setSelectedDocument } = useApp()
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => retrievedDocuments.filter(source => source.name.toLowerCase().includes(search.toLowerCase())), [retrievedDocuments, search])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[75] bg-slate-950/30 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside role="dialog" aria-modal="true" aria-label="All sources" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: .3 }} className="fixed bottom-0 right-0 top-0 z-[80] w-full max-w-md bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">All referenced sources</h2>
                <p className="text-xs text-slate-500">{retrievedDocuments.length} documents used</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}><X size={18} /></Button>
            </div>
            <div className="relative mt-5">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search sources" className="h-11 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="mt-5 space-y-3">
              {filtered.map(source => (
                <button key={source.id} onClick={() => {
                  const doc = documents.find(item => item.id === source.id || item.name === source.name)
                  if (doc) setSelectedDocument(doc)
                }} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left hover:border-blue-300 hover:bg-blue-50">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-600"><FileText size={18} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{source.name}</p>
                    <p className="text-[10px] text-slate-500">{source.section}</p>
                  </div>
                  <span className="font-bold text-emerald-600">{source.score}%</span>
                </button>
              ))}
              {!filtered.length && <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">No sources found</p>}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
