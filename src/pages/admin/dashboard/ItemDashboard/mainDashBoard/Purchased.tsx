import React, { useCallback, useEffect, useState } from "react";
import { CARS_DATA } from "./data";
enum StatusPurchase {
  PENDING = 'Pending',
  APPROVE = 'Approved',
  REJECT = 'Rejected'
}
export const PurchaseTab = React.memo(() => {

  const [filter, setFilter] = useState<string>(StatusPurchase.PENDING)
  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilter(e.target.value);    
    },
    []
  );
  const [data,setData]=useState(CARS_DATA)
  useEffect(() => {
    const filteredData = CARS_DATA.filter(car => car.status === filter); // Filter based on status
    setData(filteredData); // Update the data state with the filtered cars
  }, [filter]);
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col transition-opacity duration-300 gap-8">
      <div className="inline-flex justify-between px-6 items-center "><h3 className="text-2xl text-black font-bold font-sans ">Purchase Car</h3> 
      <select className="rounded py-2 px-3 w-40 mr-6 text-base shadow focus:outline-none focus:ring-2 focus:ring-sky-500"
        value={filter}
        onChange={handleFilterChange}>
        <option value={StatusPurchase.PENDING}>Pending</option>
        <option value={StatusPurchase.APPROVE}>Approve</option>

        <option value={StatusPurchase.REJECT}>Reject</option>

      </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((car) => (
          <div
            key={car.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="w-full h-40 bg-gray-200 rounded-lg mb-4" />
            <h3 className="font-bold text-lg mb-2">{car.name}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Giá</span>
                <span className="font-medium">${car.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Người bán</span>
                <span className="font-medium">{car.seller}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trạng thái</span>
                <span className={`
                  px-2 py-1 rounded-full text-sm
                  ${car.status === 'Approved' ? 'bg-green-100 text-green-600' :
                    car.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'}
                `}>
                  {car.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>)
});