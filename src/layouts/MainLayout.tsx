import type { ReactNode } from 'react'
import TopNavbar from '../components/TopNavbar'
import Footer from '../components/Footer'

export default function MainLayout({children,onMenu}:{children:ReactNode;onMenu:()=>void}){return <div className="flex h-screen min-h-[640px] flex-col overflow-hidden bg-slate-50 text-slate-900"><TopNavbar onMenu={onMenu}/><main className="flex min-h-0 flex-1">{children}</main><Footer/></div>}
