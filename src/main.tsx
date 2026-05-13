import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'
import { AppProviders } from './contexts/AppProviders'
import { createAppQueryClient } from './query/queryClient'
import { subscribeToAppTheme } from './stores/uiStore'

const queryClient = createAppQueryClient()

subscribeToAppTheme()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppProviders>
    </QueryClientProvider>
  </React.StrictMode>
)
