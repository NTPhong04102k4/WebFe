import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import { DataTable, Input, Modal } from "@/components/common";
import {
  useCustomerVehicles,
  useMaintenanceHistory,
  useWorkshopMutations,
} from "src/query/workshop/useWorkshopQueries";
import { brandCarRouteFn } from "src/services/api/functions/BrandCar/Routes.Fn";
import type {
  CustomerVehicleRequest,
  CustomerVehicleViewModel,
} from "src/services/api/functions/workshop/workshop.types";
import { notify } from "src/components/core/Feedback/toast";

import {
  ActionButton,
  Badge,
  formatDate,
  formatMoney,
  getErrorMessage,
  PageHeader,
} from "../workshopUi";

type VehicleForm = {
  userID: string;
  carID: string;
  vin: string;
  licensePlate: string;
  brandID: string;
  modelName: string;
  modelYear: string;
  color: string;
  currentMileage: string;
  lastServiceDate: string;
  nextServiceDate: string;
  nextServiceMileage: string;
  isActive: boolean;
};

const defaults: VehicleForm = {
  userID: "",
  carID: "",
  vin: "",
  licensePlate: "",
  brandID: "",
  modelName: "",
  modelYear: String(new Date().getFullYear()),
  color: "",
  currentMileage: "0",
  lastServiceDate: "",
  nextServiceDate: "",
  nextServiceMileage: "",
  isActive: true,
};

function toDateTime(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function fromDateTime(value?: string | null) {
  return value ? value.slice(0, 16) : "";
}

export default function CustomerVehiclesPage() {
  const [page, setPage] = useState(1);
  const [userFilter, setUserFilter] = useState("");
  const [appliedUserId, setAppliedUserId] = useState<string | undefined>();
  const [vehicleFormOpen, setVehicleFormOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerVehicleViewModel | null>(null);
  const [historyId, setHistoryId] = useState<number | null>(null);
  const [mileageVehicle, setMileageVehicle] = useState<CustomerVehicleViewModel | null>(null);
  const [mileage, setMileage] = useState("");

  const pageSize = 20;
  const { data, isLoading, isError, error } = useCustomerVehicles({
    page,
    pageSize,
    userId: appliedUserId,
  });
  const { data: history = [], isLoading: historyLoading } = useMaintenanceHistory(historyId);
  const mutations = useWorkshopMutations();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<VehicleForm>({
    defaultValues: defaults,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brand-cars"],
    queryFn: () => brandCarRouteFn.getBrandsCars(),
    staleTime: 10 * 60_000,
  });

  const openCreate = () => {
    setEditing(null);
    reset(defaults);
    setVehicleFormOpen(true);
  };

  const openEdit = (vehicle: CustomerVehicleViewModel) => {
    setEditing(vehicle);
    setVehicleFormOpen(true);
    reset({
      userID: String(vehicle.userID),
      carID: vehicle.carID ? String(vehicle.carID) : "",
      vin: vehicle.vin,
      licensePlate: vehicle.licensePlate ?? "",
      brandID: String(vehicle.brandID),
      modelName: vehicle.modelName,
      modelYear: String(vehicle.modelYear),
      color: vehicle.color ?? "",
      currentMileage: String(vehicle.currentMileage),
      lastServiceDate: fromDateTime(vehicle.lastServiceDate),
      nextServiceDate: fromDateTime(vehicle.nextServiceDate),
      nextServiceMileage: vehicle.nextServiceMileage != null ? String(vehicle.nextServiceMileage) : "",
      isActive: vehicle.isActive,
    });
  };

  const closeForm = () => {
    setEditing(null);
    setVehicleFormOpen(false);
    reset(defaults);
  };

  const saveVehicle = async (values: VehicleForm) => {
    const body: CustomerVehicleRequest = {
      userID: values.userID.trim(),
      carID: values.carID ? Number(values.carID) : null,
      vin: values.vin.trim(),
      licensePlate: values.licensePlate.trim() || null,
      brandID: Number(values.brandID),
      modelName: values.modelName.trim(),
      modelYear: Number(values.modelYear),
      color: values.color.trim() || null,
      currentMileage: Number(values.currentMileage || 0),
      lastServiceDate: toDateTime(values.lastServiceDate),
      nextServiceDate: toDateTime(values.nextServiceDate),
      nextServiceMileage: values.nextServiceMileage ? Number(values.nextServiceMileage) : null,
      isActive: values.isActive,
    };

    try {
      if (editing) {
        await mutations.updateVehicle.mutateAsync({ id: editing.customerVehicleID, body });
        notify.success("Đã cập nhật xe");
      } else {
        await mutations.createVehicle.mutateAsync(body);
        notify.success("Đã tạo xe");
      }
      closeForm();
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const updateMileage = async () => {
    if (!mileageVehicle) return;
    try {
      await mutations.patchMileage.mutateAsync({
        id: mileageVehicle.customerVehicleID,
        body: { currentMileage: Number(mileage) },
      });
      notify.success("Đã cập nhật số km");
      setMileageVehicle(null);
      setMileage("");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const removeVehicle = async (id: number) => {
    if (!window.confirm("Xóa mềm xe này?")) return;
    try {
      await mutations.deleteVehicle.mutateAsync(id);
      notify.success("Đã xóa xe");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const columns = useMemo<ColumnDef<CustomerVehicleViewModel>[]>(
    () => [
      {
        header: "Xe",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.brandName ?? `Brand #${row.original.brandID}`} {row.original.modelName}</div>
            <div className="text-xs text-slate-500">{row.original.modelYear} - {row.original.color ?? "-"}</div>
          </div>
        ),
      },
      { header: "Khách hàng", accessorKey: "ownerFullName" },
      { header: "VIN", accessorKey: "vin" },
      { header: "Biển số", accessorKey: "licensePlate" },
      {
        header: "Km",
        cell: ({ row }) => row.original.currentMileage.toLocaleString("vi-VN"),
      },
      {
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge tone={row.original.isActive ? "green" : "slate"}>
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        header: "Thao tác",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={() => openEdit(row.original)}>Sửa</ActionButton>
            <ActionButton onClick={() => {
              setMileageVehicle(row.original);
              setMileage(String(row.original.currentMileage));
            }}>Km</ActionButton>
            <ActionButton onClick={() => setHistoryId(row.original.customerVehicleID)}>Lịch sử</ActionButton>
            <ActionButton variant="danger" onClick={() => removeVehicle(row.original.customerVehicleID)}>Xóa</ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  const rows = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.totalCount ?? 0) / pageSize));

  const is401 = isError && (error as any)?.response?.status === 401;

  return (
    <div>
      <PageHeader
        title="Xe khách hàng"
        description="Quản lý xe, số km và lịch sử bảo dưỡng của khách hàng."
        action={
          <ActionButton variant="primary" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Thêm xe
          </ActionButton>
        }
      />

      <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-[1fr_auto]">
        <Input
          label="Lọc theo userId"
          value={userFilter}
          onChange={(event) => setUserFilter(event.target.value)}
          placeholder="Guid khách hàng"
        />
        <div className="flex items-end gap-2">
          <ActionButton
            variant="primary"
            onClick={() => {
              setPage(1);
              setAppliedUserId(userFilter.trim() || undefined);
            }}
          >
            <Search className="mr-2 h-4 w-4" /> Lọc
          </ActionButton>
          <ActionButton onClick={() => {
            setUserFilter("");
            setAppliedUserId(undefined);
            setPage(1);
          }}>Xóa</ActionButton>
        </div>
      </div>

      {isError && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400">
          {is401
            ? "Không có quyền truy cập danh sách xe khách hàng. Backend yêu cầu claim đặc biệt — vui lòng liên hệ kỹ thuật để kiểm tra endpoint /workshop/customer-vehicles."
            : `Lỗi tải dữ liệu: ${(error as any)?.message ?? "Unknown error"}`}
        </div>
      )}

      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => String(row.customerVehicleID)}
        loading={isLoading}
        emptyTitle="Chưa có xe"
        enablePagination={false}
      />

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>Tổng {data?.totalCount ?? 0} xe</span>
        <div className="flex gap-2">
          <ActionButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Trước</ActionButton>
          <span className="px-2 py-2">Trang {page}/{totalPages}</span>
          <ActionButton disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Sau</ActionButton>
        </div>
      </div>

      <Modal open={vehicleFormOpen} onClose={closeForm} title={editing ? "Sửa xe" : "Thêm xe"} size="xl" footer={
        <div className="flex justify-end gap-2">
          <ActionButton onClick={closeForm}>Hủy</ActionButton>
          <ActionButton variant="primary" type="submit" onClick={handleSubmit(saveVehicle)} disabled={mutations.createVehicle.isPending || mutations.updateVehicle.isPending}>Lưu</ActionButton>
        </div>
      }>
        <VehicleFields register={register} errors={errors} brands={brands} />
      </Modal>

      <Modal open={mileageVehicle !== null} onClose={() => setMileageVehicle(null)} title="Cập nhật số km" footer={
        <div className="flex justify-end gap-2">
          <ActionButton onClick={() => setMileageVehicle(null)}>Hủy</ActionButton>
          <ActionButton variant="primary" onClick={updateMileage} disabled={mutations.patchMileage.isPending}>Lưu</ActionButton>
        </div>
      }>
        <Input label="Số km hiện tại" type="number" min={0} value={mileage} onChange={(event) => setMileage(event.target.value)} />
      </Modal>

      <Modal open={historyId !== null} onClose={() => setHistoryId(null)} title="Lịch sử bảo dưỡng" size="xl">
        {historyLoading ? <p>Đang tải...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Ngày</th>
                  <th>Phiếu</th>
                  <th>Km</th>
                  <th>Dịch vụ</th>
                  <th>Chi phí</th>
                  <th>Khuyến nghị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {history.map((item) => (
                  <tr key={item.historyID}>
                    <td className="py-2">{formatDate(item.serviceDate)}</td>
                    <td>{item.workOrderNumber ?? item.workOrderID}</td>
                    <td>{item.mileage.toLocaleString("vi-VN")}</td>
                    <td>{item.servicesSummary ?? "-"}</td>
                    <td>{formatMoney(item.totalCost)}</td>
                    <td>{formatDate(item.nextRecommendedServiceDate)} / {item.nextRecommendedMileage?.toLocaleString("vi-VN") ?? "-"} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length === 0 ? <p className="py-6 text-center text-slate-500">Chưa có lịch sử.</p> : null}
          </div>
        )}
      </Modal>
    </div>
  );
}

function VehicleFields({
  register,
  errors,
  brands,
}: {
  register: ReturnType<typeof useForm<VehicleForm>>["register"];
  errors: ReturnType<typeof useForm<VehicleForm>>["formState"]["errors"];
  brands: Array<{ id?: number; brandID?: number; brandName?: string }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="UserID" required {...register("userID", { required: "Bắt buộc" })} error={errors.userID?.message} />
      <Input label="CarID" type="number" min={1} {...register("carID")} />
      <Input label="VIN" required maxLength={50} {...register("vin", { required: "Bắt buộc", maxLength: 50 })} error={errors.vin?.message} />
      <Input label="Biển số" maxLength={20} {...register("licensePlate")} />
      <label className="space-y-1">
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Hãng xe *</span>
        <select className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900" {...register("brandID", { required: "Bắt buộc" })}>
          <option value="">Chọn hãng</option>
          {brands.map((brand) => {
            const id = brand.brandID ?? brand.id ?? 0;
            return <option key={id} value={id}>{brand.brandName ?? `Brand #${id}`}</option>;
          })}
        </select>
        {errors.brandID?.message ? <p className="text-xs text-red-600">{errors.brandID.message}</p> : null}
      </label>
      <Input label="Dòng xe" required maxLength={100} {...register("modelName", { required: "Bắt buộc", maxLength: 100 })} error={errors.modelName?.message} />
      <Input label="Năm SX" required type="number" min={1900} max={2100} {...register("modelYear", { required: "Bắt buộc" })} error={errors.modelYear?.message} />
      <Input label="Màu" maxLength={50} {...register("color")} />
      <Input label="Km hiện tại" type="number" min={0} {...register("currentMileage")} />
      <Input label="Ngày bảo dưỡng gần nhất" type="datetime-local" {...register("lastServiceDate")} />
      <Input label="Ngày bảo dưỡng tiếp theo" type="datetime-local" {...register("nextServiceDate")} />
      <Input label="Km bảo dưỡng tiếp theo" type="number" min={0} {...register("nextServiceMileage")} />
      <label className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
        <input type="checkbox" {...register("isActive")} />
        Đang hoạt động
      </label>
    </div>
  );
}
