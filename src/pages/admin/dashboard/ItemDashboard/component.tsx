import React, {  } from 'react';




export interface Car {
  id: number;
  name: string;
  price: number;
  seller: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  condition: 'New' | 'Used';
  posted: string;
  imageUrl?: string;
}
export const RevenueChart: React.FC<{ data: { month: string; value: number }[] }> = React.memo(({ data }) => {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="h-64 flex items-end space-x-4 p-4">
      {data.map((item, index) => (
        <div  className="flex flex-col items-center">
          <div 
            className="w-12 bg-blue-500 rounded-t transition-all duration-300"
            style={{ height: `${(item.value/maxValue) * 100}%` }}
          ></div>
          <span className="mt-2 text-sm">{item.month}</span>
        </div>
      ))}
    </div>
  );
});

// Car List Component
export const CarList: React.FC<{ cars: Car[] }> = React.memo(({ cars }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <CarListHeader />
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </div>
    </div>
  );
});

const CarListHeader: React.FC = React.memo(() =>{ 
  return(
  <div className="p-4 border-b flex justify-between items-center">
    <h2 className="text-xl font-bold">Xe Được Đăng Bán</h2>
    <button 
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
        flex items-center space-x-2 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      <span>Thêm xe mới</span>
    </button>
  </div>)}
);

interface CarCardProps {
  car: Car;
}

// Car Card Component
export const CarCard: React.FC<CarCardProps> = React.memo(({ car }) => {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="w-full h-40 bg-gray-200 rounded-lg mb-4" />
      <h3 className="font-bold text-lg mb-2">{car.name}</h3>
      <div className="space-y-2">
        <CardInfoRow label="Giá" value={`$${car.price.toLocaleString()}`} />
        <CardInfoRow label="Người bán" value={car.seller} />
        <CardInfoRow 
          label="Tình trạng" 
          value={<StatusBadge type="condition">{car.condition}</StatusBadge>} 
        />
        <CardInfoRow 
          label="Trạng thái" 
          value={<StatusBadge type="status">{car.status}</StatusBadge>} 
        />
      </div>
    </div>
  );
});

interface CardInfoRowProps {
  label: string;
  value: React.ReactNode;
}

const CardInfoRow: React.FC<CardInfoRowProps> = React.memo(({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-500">{label}</span>
    {typeof value === 'string' ? <span className="font-medium">{value}</span> : value}
  </div>
));

interface StatusBadgeProps {
  type: 'condition' | 'status';
  children: string;
}

// Status Badge Component
export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({ type, children }) => {
  const getStatusColor = () => {
    if (type === 'condition') {
      return children === 'New' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600';
    }
    const statusColors = {
      'Approved': 'bg-blue-100 text-blue-600',
      'Pending': 'bg-orange-100 text-orange-600',
      'Rejected': 'bg-red-100 text-red-600'
    } as const;
    
    return statusColors[children as keyof typeof statusColors] || 'bg-gray-100 text-gray-600';
  };

  return (
    <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor()}`}>
      {children}
    </span>
  );
});



