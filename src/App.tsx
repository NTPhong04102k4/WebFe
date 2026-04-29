import { Toaster } from 'react-hot-toast'
import AppRouter from '@/router'

export default function App() {
  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { fontSize: '14px', maxWidth: '380px' },
          success: { iconTheme: { primary: '#2563eb', secondary: '#fff' } },
        }}
      />
    </>
  )
}
