import type { ReactNode } from 'react'
import TopNavbar from '../components/TopNavbar'
import Footer from '../components/Footer'

export default function MainLayout({children,onSettings,onHelp}:{children:ReactNode;onSettings:()=>void;onHelp:()=>void}){return <div className="flex h-screen min-h-[640px] flex-col overflow-hidden bg-slate-50 text-slate-900"><TopNavbar onSettings={onSettings} onHelp={onHelp}/><main className="flex min-h-0 flex-1">{children}</main><Footer/></div>}
