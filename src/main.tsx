import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import { AppProvider } from './context/AppContext'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><ErrorBoundary><AppProvider><App /></AppProvider></ErrorBoundary></React.StrictMode>,
)
