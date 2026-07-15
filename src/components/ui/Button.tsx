import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2', {
  variants: {
    variant: {
      primary: 'bg-blue-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md',
      secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700',
      ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
      danger: 'text-red-600 hover:bg-red-50',
    },
    size: { sm: 'h-9 px-3', md: 'h-11 px-4', icon: 'h-10 w-10 p-0' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
))
Button.displayName = 'Button'
