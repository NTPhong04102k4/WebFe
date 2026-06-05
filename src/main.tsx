import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'
import { AppProviders } from './contexts/AppProviders'
import { appQueryClient } from './query/queryClient'
import { subscribeToAppTheme } from './stores/uiStore'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'

subscribeToAppTheme();

// Khi deploy mới, chunk hash thay đổi → lazy import 404 → reload lấy index.html mới
window.addEventListener('vite:preloadError', () => window.location.reload())

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={appQueryClient}>
        <AppProviders>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AppProviders>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
