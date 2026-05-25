import { Toaster } from 'react-hot-toast'
import AppRouter from '@/router'

export default function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="top-right" />
    </>
  )
}
