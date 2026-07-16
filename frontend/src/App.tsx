import { useState, type FormEvent } from 'react'
import Dashboard from './pages/Dashboard'
import { AppProvider } from './context/AppContext'
import { login, register, setAccessToken } from './services/api'

export default function App() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (isRegistering) {
        await register(email.trim(), password)
      }

      const result = await login(email.trim(), password)
      setAccessToken(result.access_token)
      setIsAuthenticated(true)
      setPassword('')
    } catch {
      setError('Unable to sign in. Check your details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleLogout() {
    setAccessToken('')
    setIsAuthenticated(false)
    setPassword('')
  }

  if (isAuthenticated) {
    return (
      <AppProvider userEmail={email.trim()} onLogout={handleLogout}>
        <Dashboard />
      </AppProvider>
    )
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">Simple RAG</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {isRegistering ? 'Create your account' : 'Sign in to your workspace'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Upload documents, retrieve owned sources, and ask questions through the secured API.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Email</span>
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Password</span>
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              minLength={12}
              required
            />
          </label>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Please wait...' : isRegistering ? 'Register and sign in' : 'Sign in'}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegistering(current => !current)
              setError('')
            }}
            className="h-10 w-full rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            {isRegistering ? 'Use an existing account' : 'Create an account'}
          </button>
        </form>
      </section>
    </main>
  )
}
