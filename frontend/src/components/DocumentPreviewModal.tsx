import { FileText, Highlighter } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Modal } from './ui/Modal'

export default function DocumentPreviewModal() {
  const { selectedDocument, setSelectedDocument, retrievedDocuments } = useApp()
  if (!selectedDocument) return null

  const reference = retrievedDocuments.find(source => source.id === selectedDocument.id || source.name === selectedDocument.name)

  return (
    <Modal open onClose={() => setSelectedDocument(null)} title={selectedDocument.name}>
      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-500"><FileText size={19} /></span>
          <div>
            <p className="text-xs font-semibold">{selectedDocument.type} - {selectedDocument.size}</p>
            <p className="text-[10px] text-slate-500">Indexed {selectedDocument.updatedAt}</p>
          </div>
        </div>
      </div>
      <div className="relative mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
          Full document text stays server-side. The UI displays only metadata and retrieved source names.
        </div>
        {reference && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-[11px] font-semibold text-yellow-800">
            <Highlighter size={14} /> Referenced by the latest answer with {reference.score}% similarity.
          </div>
        )}
      </div>
    </Modal>
  )
}
