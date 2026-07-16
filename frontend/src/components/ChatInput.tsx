import { Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useApp } from '../context/AppContext'
import { Button } from './ui/Button'

type FormValues = { question: string }

export default function ChatInput() {
  const { sendMessage, loading } = useApp()
  const { register, handleSubmit, reset, watch } = useForm<FormValues>({ defaultValues: { question: '' } })

  const submit = ({ question }: FormValues) => {
    if (!question.trim() || loading) return
    void sendMessage(question.trim())
    reset()
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_8px_30px_rgba(15,23,42,.08)] transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
        <textarea
          {...register('question')}
          rows={1}
          className="max-h-32 min-h-12 w-full resize-none bg-transparent px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
          placeholder="Ask about your uploaded documents..."
          aria-label="Question"
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void handleSubmit(submit)()
            }
          }}
        />
        <div className="flex items-center">
          <p className="px-3 text-[10px] text-slate-400">Answers are generated from retrieved document context.</p>
          <Button type="submit" size="sm" className="ml-auto h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 shadow-lg shadow-blue-100" disabled={!watch('question').trim() || loading}>
            {loading ? 'Sending' : 'Send'} <Send size={15} />
          </Button>
        </div>
      </div>
    </form>
  )
}
