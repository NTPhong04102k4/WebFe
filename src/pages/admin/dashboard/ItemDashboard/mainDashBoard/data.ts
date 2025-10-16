import { CarDetail } from "src/pages/home/item/typeData";

export interface RevenueData {
 
    value: number;

    day:Date;  
    idCar:string|number,
    idStaff:string|number,
    idUser:string|number
  }
  
  export interface SellCar {
    id: number;
    name: string;
    price: number;
    seller: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    condition: 'New' | 'Used';
    posted: string;
    imageUrl?: string;
  }
  enum Plan{
    BASIC='Basic',
    STANDARD='Standard',
    PROFESSIONAL="Professional",
    ENTERPRISE="Enterprise",
    FREE="Free"
  }
  export interface User{
    id:number|string,
    dateRegister:Date;
    name:string,
    phone:number|string|undefined|null,
    email:string|undefined|null,
    amountPurchase:string|number,
    hasCar:CarDetail[];
    plan:Plan,
    sellCar:SellCar[],
    IDface:string|null|undefined,
    IDTwitter:string|null|undefined,
    IDInstagram:undefined|null|string,
    IDLinkIn:undefined|null|string,
    // servicesUsed: Maintaince|autoParts;
  }
  export  interface TabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
  }
  

  export interface RevenueData {
    value: number;
    day: Date;
    idCar: string | number;
    idStaff: string | number;
    idUser: string | number;
  }
  
  export const REVENUE_DATA: RevenueData[] = [
    { value: 15000, day: new Date(2024, 0, 15), idCar: 1, idStaff: 'S000_1', idUser: 'U_0001' },
    { value: 22000, day: new Date(2024, 1, 12), idCar: 2, idStaff: 'S000_2', idUser: 'U_0002' },
    { value: 30000, day: new Date(2024, 2, 7), idCar: 3, idStaff: 'S000_3', idUser: 'U_0003' },
    { value: 17000, day: new Date(2024, 3, 21), idCar: 4, idStaff: 'S000_4', idUser: 'U_0004' },
    { value: 25000, day: new Date(2024, 4, 3), idCar: 5, idStaff: 'S000_5', idUser: 'U_0005' },
    { value: 19000, day: new Date(2024, 5, 15), idCar: 6, idStaff: 'S000_6', idUser: 'U_0006' },
    { value: 27000, day: new Date(2024, 6, 29), idCar: 7, idStaff: 'S000_7', idUser: 'U_0007' },
    { value: 34000, day: new Date(2024, 7, 18), idCar: 8, idStaff: 'S000_8', idUser: 'U_0008' },
    { value: 21000, day: new Date(2024, 8, 6), idCar: 9, idStaff: 'S000_9', idUser: 'U_0009' },
    { value: 38000, day: new Date(2024, 9, 30), idCar: 10, idStaff: 'S000_10', idUser: 'U_00010' },
    { value: 23000, day: new Date(2024, 10, 12), idCar: 11, idStaff: 'S000_11', idUser: 'U_00011' },
    { value: 15000, day: new Date(2024, 11, 5), idCar: 12, idStaff: 'S000_12', idUser: 'U_00012' },
    { value: 16000, day: new Date(2024, 0, 15), idCar: 13, idStaff: 'S000_13', idUser: 'U_00013' },
    { value: 22000, day: new Date(2024, 1, 12), idCar: 14, idStaff: 'S000_14', idUser: 'U_00014' },
    { value: 28000, day: new Date(2024, 2, 7), idCar: 15, idStaff: 'S000_15', idUser: 'U_00015' },
    { value: 19000, day: new Date(2024, 3, 21), idCar: 16, idStaff: 'S000_16', idUser: 'U_00016' },
    { value: 25000, day: new Date(2024, 4, 3), idCar: 17, idStaff: 'S000_17', idUser: 'U_00017' },
    { value: 21000, day: new Date(2024, 5, 15), idCar: 18, idStaff: 'S000_18', idUser: 'U_00018' },
    { value: 27000, day: new Date(2024, 6, 29), idCar: 19, idStaff: 'S000_19', idUser: 'U_00019' },
    { value: 35000, day: new Date(2024, 7, 18), idCar: 20, idStaff: 'S000_20', idUser: 'U_00020' },
    { value: 23000, day: new Date(2024, 8, 6), idCar: 21, idStaff: 'S000_21', idUser: 'U_00021' },
    { value: 39000, day: new Date(2024, 9, 30), idCar: 22, idStaff: 'S000_22', idUser: 'U_00022' },
    { value: 24000, day: new Date(2024, 10, 12), idCar: 23, idStaff: 'S000_23', idUser: 'U_00023' },
    { value: 16000, day: new Date(2024, 11, 5), idCar: 24, idStaff: 'S000_24', idUser: 'U_00024' },
    { value: 17000, day: new Date(2024, 0, 15), idCar: 25, idStaff: 'S000_25', idUser: 'U_00025' },
    { value: 23000, day: new Date(2024, 1, 12), idCar: 26, idStaff: 'S000_26', idUser: 'U_00026' },
    { value: 30000, day: new Date(2024, 2, 7), idCar: 27, idStaff: 'S000_27', idUser: 'U_00027' },
    { value: 20000, day: new Date(2024, 3, 21), idCar: 28, idStaff: 'S000_28', idUser: 'U_00028' },
    { value: 26000, day: new Date(2024, 4, 3), idCar: 29, idStaff: 'S000_29', idUser: 'U_00029' },
    { value: 22000, day: new Date(2024, 5, 15), idCar: 30, idStaff: 'S000_30', idUser: 'U_00030' },
    { value: 28000, day: new Date(2024, 6, 29), idCar: 31, idStaff: 'S000_31', idUser: 'U_00031' },
    { value: 36000, day: new Date(2024, 7, 18), idCar: 32, idStaff: 'S000_32', idUser: 'U_00032' },
    { value: 24000, day: new Date(2024, 8, 6), idCar: 33, idStaff: 'S000_33', idUser: 'U_00033' },
    { value: 40000, day: new Date(2024, 9, 30), idCar: 34, idStaff: 'S000_34', idUser: 'U_00034' },
    { value: 25000, day: new Date(2024, 10, 12), idCar: 35, idStaff: 'S000_35', idUser: 'U_00035' },
    { value: 17000, day: new Date(2024, 11, 5), idCar: 36, idStaff: 'S000_36', idUser: 'U_00036' },
    { value: 18000, day: new Date(2024, 0, 15), idCar: 37, idStaff: 'S000_37', idUser: 'U_00037' },
    { value: 24000, day: new Date(2024, 1, 12), idCar: 38, idStaff: 'S000_38', idUser: 'U_00038' },
    { value: 31000, day: new Date(2024, 2, 7), idCar: 39, idStaff: 'S000_39', idUser: 'U_00039' },
    { value: 21000, day: new Date(2024, 3, 21), idCar: 40, idStaff: 'S000_40', idUser: 'U_00040' },
    { value: 27000, day: new Date(2024, 4, 3), idCar: 41, idStaff: 'S000_41', idUser: 'U_00041' },
    { value: 23000, day: new Date(2024, 5, 15), idCar: 42, idStaff: 'S000_42', idUser: 'U_00042' },
    { value: 29000, day: new Date(2024, 6, 29), idCar: 43, idStaff: 'S000_43', idUser: 'U_00043' },
    { value: 37000, day: new Date(2024, 7, 18), idCar: 44, idStaff: 'S000_44', idUser: 'U_00044' },
    { value: 25000, day: new Date(2024, 8, 6), idCar: 45, idStaff: 'S000_45', idUser: 'U_00045' },
    { value: 41000, day: new Date(2024, 9, 30), idCar: 46, idStaff: 'S000_46', idUser: 'U_00046' },
    { value: 26000, day: new Date(2024, 10, 12), idCar: 47, idStaff: 'S000_47', idUser: 'U_00047' },
    { value: 18000, day: new Date(2024, 11, 5), idCar: 48, idStaff: 'S000_48', idUser: 'U_00048' },
    { value: 19000, day: new Date(2024, 0, 15), idCar: 49, idStaff: 'S000_49', idUser: 'U_00049' },
    { value: 25000, day: new Date(2024, 1, 12), idCar: 50, idStaff: 'S000_50', idUser: 'U_00050' }
  ];
  
  export const CARS_DATA: SellCar[] = [
    { id: 1, name: 'Toyota Camry 2.5Q', price: 35000, seller: 'John Doe', status: 'Pending', condition: 'New', posted: '2024-03-20' },
    { id: 2, name: 'Honda Civic RS', price: 28000, seller: 'Jane Smith', status: 'Approved', condition: 'Used', posted: '2024-03-19' },
    { id: 3, name: 'Ford Mustang', price: 450000, seller: 'Robert Johnson', status: 'Rejected', condition: 'New', posted: '2024-03-18' },
    { id: 4, name: 'Chevrolet Malibu', price: 32000, seller: 'Emily Davis', status: 'Pending', condition: 'Used', posted: '2024-03-17' },
    { id: 5, name: 'BMW 3 Series', price: 37000, seller: 'Michael Wilson', status: 'Approved', condition: 'New', posted: '2024-03-16' },
    { id: 6, name: 'Audi A4', price: 42000, seller: 'Linda Anderson', status: 'Pending', condition: 'Used', posted: '2024-03-15' },
    { id: 7, name: 'Mercedes-Benz C-Class', price: 55000, seller: 'William Clark', status: 'Approved', condition: 'New', posted: '2024-03-14' },
    { id: 8, name: 'Volkswagen Passat', price: 30000, seller: 'Patricia Lewis', status: 'Rejected', condition: 'Used', posted: '2024-03-13' },
    { id: 9, name: 'Kia Optima', price: 27000, seller: 'Thomas Hall', status: 'Pending', condition: 'New', posted: '2024-03-12' },
    { id: 10, name: 'Nissan Altima', price: 29000, seller: 'Barbara Lee', status: 'Approved', condition: 'Used', posted: '2024-03-11' }
  ];
  export const Maintaince={
    "maintenanceRecords": [
      {
        "id": "M001",
        "servicesUsed": {
          "Maintenance": ["Thay dầu động cơ", "Kiểm tra phanh"],
          "autoParts": ["Lọc dầu", "Dầu động cơ 5W-40"]
        },
        "totalCost": 1200000,
        "mileage": 5000,
        "date": "2024-01-15"
      },
      {
        "id": "M002",
        "servicesUsed": {
          "Maintenance": ["Bảo dưỡng định kỳ", "Cân bằng động"],
          "autoParts": ["Lọc gió động cơ", "Bugi"]
        },
        "totalCost": 2500000,
        "mileage": 10000,
        "date": "2024-02-01"
      },
      {
        "id": "M003",
        "servicesUsed": {
          "Maintenance": ["Thay dầu hộp số", "Kiểm tra điện"],
          "autoParts": ["Dầu hộp số", "Acquy mới"]
        },
        "totalCost": 3500000,
        "mileage": 15000,
        "date": "2024-02-15"
      },
      {
        "id": "M004",
        "servicesUsed": {
          "Maintenance": ["Thay lốp", "Cân chỉnh thước lái"],
          "autoParts": ["Bộ lốp mới", "Dầu phanh"]
        },
        "totalCost": 5000000,
        "mileage": 20000,
        "date": "2024-03-01"
      },
      {
        "id": "M005",
        "servicesUsed": {
          "Maintenance": ["Bảo dưỡng hệ thống điều hòa", "Vệ sinh kim phun"],
          "autoParts": ["Gas điều hòa", "Lọc điều hòa"]
        },
        "totalCost": 1800000,
        "mileage": 25000,
        "date": "2024-03-15"
      },
      {
        "id": "M006",
        "servicesUsed": {
          "Maintenance": ["Thay má phanh", "Kiểm tra giảm xóc"],
          "autoParts": ["Má phanh trước", "Má phanh sau"]
        },
        "totalCost": 2800000,
        "mileage": 30000,
        "date": "2024-03-30"
      },
      {
        "id": "M007",
        "servicesUsed": {
          "Maintenance": ["Đại tu động cơ", "Thay dây curoa"],
          "autoParts": ["Bộ pistons", "Dây curoa cam"]
        },
        "totalCost": 15000000,
        "mileage": 35000,
        "date": "2024-04-15"
      },
      {
        "id": "M008",
        "servicesUsed": {
          "Maintenance": ["Thay dầu", "Bảo dưỡng hệ thống làm mát"],
          "autoParts": ["Dầu động cơ", "Nước làm mát"]
        },
        "totalCost": 1500000,
        "mileage": 40000,
        "date": "2024-05-01"
      },
      {
        "id": "M009",
        "servicesUsed": {
          "Maintenance": ["Kiểm tra tổng thể", "Cân bằng động"],
          "autoParts": ["Lọc nhiên liệu", "Cao su cân bằng"]
        },
        "totalCost": 2000000,
        "mileage": 45000,
        "date": "2024-05-15"
      },
      {
        "id": "M010",
        "servicesUsed": {
          "Maintenance": ["Thay bộ ly hợp", "Kiểm tra hộp số"],
          "autoParts": ["Bộ ly hợp", "Ổ bi"]
        },
        "totalCost": 8000000,
        "mileage": 50000,
        "date": "2024-05-30"
      }
    ]
  }
  export const Employees={
    "employees": [
      {
        "id": "NV001",
        "hoTen": "Nguyễn Văn An",
        "gioiTinh": "Nam",
        "ngaySinh": "1985-05-15",
        "queQuan": "Xã Đông Thành, Huyện Yên Thành, Nghệ An",
        "chucVu": "Quản lý kỹ thuật",
        "mucLuong": 25000000,
        "ngayVaoLam": "2020-01-15",
        "ngayNghiViec": null,
        "trangThai": "Đang làm việc"
      },
      {
        "id": "NV002",
        "hoTen": "Trần Thị Bình",
        "gioiTinh": "Nữ",
        "ngaySinh": "1990-08-22",
        "queQuan": "Phường Tân Thành, Quận Tân Phú, TP.HCM",
        "chucVu": "Kế toán",
        "mucLuong": 18000000,
        "ngayVaoLam": "2020-03-01",
        "ngayNghiViec": null,
        "trangThai": "Đang làm việc"
      },
      {
        "id": "NV003",
        "hoTen": "Lê Văn Cường",
        "gioiTinh": "Nam",
        "ngaySinh": "1988-12-03",
        "queQuan": "Xã Xuân Thủy, Huyện Lệ Thủy, Quảng Bình",
        "chucVu": "Kỹ thuật viên cao cấp",
        "mucLuong": 20000000,
        "ngayVaoLam": "2020-02-15",
        "ngayNghiViec": null,
        "trangThai": "Đang làm việc"
      },
      {
        "id": "NV004",
        "hoTen": "Phạm Thị Dung",
        "gioiTinh": "Nữ",
        "ngaySinh": "1992-04-25",
        "queQuan": "Phường Láng Hạ, Quận Đống Đa, Hà Nội",
        "chucVu": "Nhân viên bán hàng",
        "mucLuong": 15000000,
        "ngayVaoLam": "2021-05-01",
        "ngayNghiViec": "2023-12-31",
        "trangThai": "Đã nghỉ việc"
      },
      {
        "id": "NV005",
        "hoTen": "Hoàng Văn Em",
        "gioiTinh": "Nam",
        "ngaySinh": "1995-11-18",
        "queQuan": "Xã Tân Lập, Huyện Đan Phượng, Hà Nội",
        "chucVu": "Kỹ thuật viên",
        "mucLuong": 16000000,
        "ngayVaoLam": "2021-06-15",
        "ngayNghiViec": null,
        "trangThai": "Đang làm việc"
      },
      {
        "id": "NV006",
        "hoTen": "Nguyễn Thị Phương",
        "gioiTinh": "Nữ",
        "ngaySinh": "1993-07-30",
        "queQuan": "Phường Hòa Cường Nam, Quận Hải Châu, Đà Nẵng",
        "chucVu": "Nhân viên tiếp tân",
        "mucLuong": 12000000,
        "ngayVaoLam": "2022-01-10",
        "ngayNghiViec": null,
        "trangThai": "Đang làm việc"
      },
      {
        "id": "NV007",
        "hoTen": "Trần Văn Giỏi",
        "gioiTinh": "Nam",
        "ngaySinh": "1987-09-12",
        "queQuan": "Xã Mỹ Thạnh, Huyện Giồng Trôm, Bến Tre",
        "chucVu": "Kỹ thuật viên điện tử",
        "mucLuong": 18000000,
        "ngayVaoLam": "2021-03-20",
        "ngayNghiViec": null,
        "trangThai": "Đang làm việc"
      },
      {
        "id": "NV008",
        "hoTen": "Lê Thị Hương",
        "gioiTinh": "Nữ",
        "ngaySinh": "1991-02-28",
        "queQuan": "Phường Phú Hòa, TP. Thủ Dầu Một, Bình Dương",
        "chucVu": "Nhân viên marketing",
        "mucLuong": 14000000,
        "ngayVaoLam": "2022-04-01",
        "ngayNghiViec": "2024-02-29",
        "trangThai": "Đã nghỉ việc"
      },
      {
        "id": "NV009",
        "hoTen": "Đỗ Văn Inh",
        "gioiTinh": "Nam",
        "ngaySinh": "1989-10-05",
        "queQuan": "Xã Hòa Bình, Huyện Vĩnh Bảo, Hải Phòng",
        "chucVu": "Thợ sơn",
        "mucLuong": 17000000,
        "ngayVaoLam": "2021-08-15",
        "ngayNghiViec": null,
        "trangThai": "Đang làm việc"
      },
      {
        "id": "NV010",
        "hoTen": "Nguyễn Thị Kim",
        "gioiTinh": "Nữ",
        "ngaySinh": "1994-06-20",
        "queQuan": "Phường 2, TP. Vũng Tàu, Bà Rịa - Vũng Tàu",
        "chucVu": "Nhân viên kho",
        "mucLuong": 13000000,
        "ngayVaoLam": "2022-07-01",
        "ngayNghiViec": null,
        "trangThai": "Đang làm việc"
      }
    ]
  }