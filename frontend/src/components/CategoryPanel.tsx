import { FileText, Search, SlidersHorizontal } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Category } from '../types'
import { cn } from '../utils/cn'

const categories:Category[]=[{label:'All Documents',icon:SlidersHorizontal},{label:'Uploaded Documents',icon:FileText},{label:'Retrieved Sources',icon:Search}]
export default function CategoryPanel(){const {selectedCategory,setSelectedCategory}=useApp();return <aside aria-label="Document filters" className="hidden w-[190px] shrink-0 overflow-y-auto border-r border-slate-200 bg-[#fbfcfe] p-4 xl:block 2xl:w-[220px]"><h2 className="section-label px-1">Filters</h2><div className="mt-3 space-y-2">{categories.map(({label,icon:Icon})=><button key={label} aria-pressed={selectedCategory===label} onClick={()=>setSelectedCategory(label)} className={cn('group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm',selectedCategory===label?'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-100':'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700')}><Icon size={16} className={cn(selectedCategory===label?'text-white':'text-slate-400 group-hover:text-blue-600')}/>{label}</button>)}</div></aside>}
