import { FileText, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { Modal } from './ui/Modal'

export default function LibraryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { documents, setSelectedDocument, removeDocument } = useApp()
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState('')
  const filtered = useMemo(() => documents.filter(doc => doc.name.toLowerCase().includes(search.toLowerCase())), [documents, search])

  return (
    <Modal open={open} onClose={onClose} title="Document Library">
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search all documents" className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-blue-400" />
      </div>
      <div className="max-h-[55vh] space-y-2 overflow-y-auto">
        {filtered.map(doc => (
          <div key={doc.id} className="flex items-center rounded-xl border border-slate-200 transition hover:border-blue-200 hover:bg-blue-50">
            <button onClick={() => setSelectedDocument(doc)} className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-50 text-red-500"><FileText size={17} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{doc.name}</p>
                <p className="text-[10px] text-slate-500">{doc.type} - {doc.size}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">OWNED</span>
            </button>
            <button
              disabled={deleting === doc.id}
              onClick={async () => {
                setDeleting(doc.id)
                try {
                  await removeDocument(doc.id)
                } finally {
                  setDeleting('')
                }
              }}
              className="mr-3 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              aria-label={`Remove ${doc.name}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">No search results</p>}
      </div>
    </Modal>
  )
}
