import { Keyboard } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import BookmarksModal from '../components/BookmarksModal'
import CategoryPanel from '../components/CategoryPanel'
import ChatArea from '../components/ChatArea'
import DashboardAnalytics from '../components/DashboardAnalytics'
import DocumentPreviewModal from '../components/DocumentPreviewModal'
import InformationPanel from '../components/InformationPanel'
import LibraryModal from '../components/LibraryModal'
import SettingsModal from '../components/SettingsModal'
import Sidebar from '../components/Sidebar'
import SourcesDrawer from '../components/SourcesDrawer'
import UploadDocumentsModal from '../components/UploadDocumentsModal'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { useApp } from '../context/AppContext'
import MainLayout from '../layouts/MainLayout'

export default function Dashboard(){
  const {setSidebarOpen,view,toast,newChat}=useApp()
  const [upload,setUpload]=useState(false)
  const [settings,setSettings]=useState(false)
  const [docs,setDocs]=useState(false)
  const [sources,setSources]=useState(false)
  const [help,setHelp]=useState(false)
  const [bookmarks,setBookmarks]=useState(false)

  useEffect(()=>{
    const shortcut=(event:KeyboardEvent)=>{
      if(!(event.ctrlKey||event.metaKey))return
      if(event.key.toLowerCase()==='k'){event.preventDefault();document.getElementById('policy-search')?.focus()}
      if(event.key.toLowerCase()==='n'){event.preventDefault();newChat()}
      if(event.key==='/'){event.preventDefault();setHelp(true)}
    }
    window.addEventListener('keydown',shortcut)
    return()=>window.removeEventListener('keydown',shortcut)
  },[newChat])

  return <MainLayout onSettings={()=>setSettings(true)} onHelp={()=>setHelp(true)}>
    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.3}} className="flex min-w-0 flex-1">
      <Sidebar onClose={()=>setSidebarOpen(false)} onUpload={()=>setUpload(true)} onSettings={()=>setSettings(true)} onDocuments={()=>setDocs(true)} onBookmarks={()=>setBookmarks(true)}/>
      {view==='chat'?<><CategoryPanel/><ChatArea/><InformationPanel onSources={()=>setSources(true)}/></>:<DashboardAnalytics/>}
    </motion.div>
    <UploadDocumentsModal open={upload} onClose={()=>setUpload(false)}/>
    <SettingsModal open={settings} onClose={()=>setSettings(false)}/>
    <LibraryModal open={docs} onClose={()=>setDocs(false)}/>
    <BookmarksModal open={bookmarks} onClose={()=>setBookmarks(false)}/>
    <DocumentPreviewModal/>
    <SourcesDrawer open={sources} onClose={()=>setSources(false)}/>
    <Modal open={help} onClose={()=>setHelp(false)} title="Help & keyboard shortcuts">
      <div className="rounded-xl bg-blue-50 p-4"><div className="flex items-center gap-2 text-blue-700"><Keyboard size={18}/><p className="text-sm font-bold">Move faster with shortcuts</p></div></div>
      <div className="mt-4 space-y-2">{[['Ctrl + K','Focus policy search'],['Ctrl + N','Start a new chat'],['Ctrl + /','Open help'],['Esc','Close the active modal'],['Enter','Send a question'],['Shift + Enter','Add a new line']].map(([keys,label])=><div key={keys} className="flex items-center justify-between rounded-xl border border-slate-200 p-3"><span className="text-xs text-slate-600">{label}</span><kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold">{keys}</kbd></div>)}</div>
      <Button className="mt-5 w-full" onClick={()=>setHelp(false)}>Got it</Button>
    </Modal>
    <AnimatePresence>{toast&&<motion.div role="status" initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl">{toast}</motion.div>}</AnimatePresence>
  </MainLayout>
}
