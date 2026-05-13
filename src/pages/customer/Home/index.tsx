import { Link } from 'react-router-dom'
import { ArrowRight, Car, Package, Wrench } from 'lucide-react'
import { useBrandCarList } from '@/query/brand-car/useBrandCarQueries'
import { useBodyTypeList } from '@/query/body-type/useBodyTypeQueries'

export default function HomePage() {
  const { data: brandCars = [] } = useBrandCarList()
  const { data: bodyTypes = [] } = useBodyTypeList()
  const visibleBrands = brandCars.slice(0, 6)
  const visibleBodies = bodyTypes.slice(0, 6)

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

      {visibleBrands.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-950">
              Explore Our Premium Brands
            </h2>
            <Link
              to="/cars"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-blue-700"
            >
              Show All Brands <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {visibleBrands.map((brand) => (
              <Link
                key={brand.brandCode}
                to={`/cars?brandCode=${encodeURIComponent(brand.brandCode)}`}
                className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
              >
                {brand.logoPath ? (
                  <img
                    src={brand.logoPath}
                    alt={brand.brandName}
                    className="h-16 w-24 object-contain"
                  />
                ) : (
                  <Car className="h-14 w-14 text-slate-300" />
                )}
                <span className="mt-4 text-center text-base font-semibold text-slate-950">
                  {brand.brandName}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {visibleBodies.length > 0 ? (
        <section className="bg-slate-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="mb-8 text-center text-3xl font-bold text-slate-950">
              Select a Body Styles
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {visibleBodies.map((body) => (
                <Link
                  key={body.bodyCode}
                  to={`/cars?bodyCode=${encodeURIComponent(body.bodyCode)}`}
                  className="flex flex-col items-center justify-end rounded-lg bg-white p-3 transition hover:shadow-sm"
                >
                  {body.imagePath ? (
                    <img
                      src={body.imagePath}
                      alt={body.bodyName}
                      className="h-24 w-full object-contain"
                    />
                  ) : (
                    <Car className="h-20 w-20 text-slate-300" />
                  )}
                  <span className="mt-3 text-center text-base font-semibold text-slate-950">
                    {body.bodyName}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

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
