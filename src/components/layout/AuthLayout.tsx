import { Outlet } from 'react-router-dom'
import { Car } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
            <Car className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">SoldCars</h1>
          <p className="mt-1 text-sm text-slate-400">Hệ thống mua bán xe hơi</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
