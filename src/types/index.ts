import type { LucideIcon } from 'lucide-react'

export type Category = { label: string; icon: LucideIcon }
export type RetrievedDocument = { name: string; page: string; section?: string; score: number }
export type ChatItem = { id: number; role: 'user' | 'assistant'; content: string; detail?: string }
