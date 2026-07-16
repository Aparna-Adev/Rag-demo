import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.045)]', className)} {...props} />
}
