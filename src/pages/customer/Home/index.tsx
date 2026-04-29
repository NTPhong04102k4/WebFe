import { Link } from 'react-router-dom'
import { ArrowRight, Car, Package, Wrench } from 'lucide-react'

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[560px] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-4 text-white">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            Xe hơi chất lượng<br />
            <span className="text-blue-400">giá tốt nhất Việt Nam</span>
          </h1>
          <p className="mb-8 text-lg text-slate-300">
            Hàng trăm mẫu xe mới & đã qua sử dụng, kiểm định nghiêm ngặt, bảo hành chính hãng.
          </p>
          <Link
            to="/cars"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold transition hover:bg-blue-500"
          >
            Xem xe ngay <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { icon: <Car className="h-8 w-8 text-blue-600" />, title: 'Xe đa dạng', desc: 'Sedan, SUV, Hatchback, Truck — đủ mọi phân khúc' },
            { icon: <Package className="h-8 w-8 text-blue-600" />, title: 'Phụ kiện chính hãng', desc: 'Phụ kiện chất lượng cao, bảo hành đầy đủ' },
            { icon: <Wrench className="h-8 w-8 text-blue-600" />, title: 'Xưởng dịch vụ', desc: 'Đặt lịch bảo dưỡng, sửa chữa chuyên nghiệp' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3">{f.icon}</div>
              <h3 className="mb-1 text-base font-semibold text-slate-800">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 text-center text-white">
        <h2 className="mb-3 text-3xl font-bold">Tìm xe phù hợp ngay hôm nay</h2>
        <p className="mb-6 text-blue-100">Duyệt hàng trăm mẫu xe, lọc theo thương hiệu, giá, loại xe</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/cars" className="rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50">
            Xem danh sách xe
          </Link>
          <Link to="/accessories" className="rounded-xl border border-white/30 px-6 py-3 font-semibold hover:bg-white/10">
            Xem phụ kiện
          </Link>
        </div>
      </section>
    </div>
  )
}
