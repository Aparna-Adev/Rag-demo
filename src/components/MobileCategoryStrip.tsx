import { useApp } from '../context/AppContext'
import { cn } from '../utils/cn'

const categories=['All Policies','Attendance','Leave','Payroll','Benefits','Travel','Recruitment','Security','Exit Process']
export default function MobileCategoryStrip(){const {selectedCategory,setSelectedCategory}=useApp();return <div className="border-b border-slate-200 bg-white px-4 py-2 xl:hidden"><div className="flex gap-2 overflow-x-auto pb-1">{categories.map(category=><button key={category} onClick={()=>setSelectedCategory(category)} aria-pressed={category===selectedCategory} className={cn('shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-semibold',category===selectedCategory?'border-blue-600 bg-blue-600 text-white':'border-slate-200 bg-white text-slate-600')}>{category}</button>)}</div></div>}
