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
  const { data, isLoading } = useCustomerVehicles({
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
        notify.success("Da cap nhat xe");
      } else {
        await mutations.createVehicle.mutateAsync(body);
        notify.success("Da tao xe");
      }
      closeForm();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const updateMileage = async () => {
    if (!mileageVehicle) return;
    try {
      await mutations.patchMileage.mutateAsync({
        id: mileageVehicle.customerVehicleID,
        body: { currentMileage: Number(mileage) },
      });
      notify.success("Da cap nhat so km");
      setMileageVehicle(null);
      setMileage("");
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const removeVehicle = async (id: number) => {
    if (!window.confirm("Xoa mem xe nay?")) return;
    try {
      await mutations.deleteVehicle.mutateAsync(id);
      notify.success("Da xoa xe");
    } catch (error) {
      notify.error(getErrorMessage(error));
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
      { header: "Khach hang", accessorKey: "ownerFullName" },
      { header: "VIN", accessorKey: "vin" },
      { header: "Bien so", accessorKey: "licensePlate" },
      {
        header: "Km",
        cell: ({ row }) => row.original.currentMileage.toLocaleString("vi-VN"),
      },
      {
        header: "Trang thai",
        cell: ({ row }) => (
          <Badge tone={row.original.isActive ? "green" : "slate"}>
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        header: "Thao tac",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={() => openEdit(row.original)}>Sua</ActionButton>
            <ActionButton onClick={() => {
              setMileageVehicle(row.original);
              setMileage(String(row.original.currentMileage));
            }}>Km</ActionButton>
            <ActionButton onClick={() => setHistoryId(row.original.customerVehicleID)}>Lich su</ActionButton>
            <ActionButton variant="danger" onClick={() => removeVehicle(row.original.customerVehicleID)}>Xoa</ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  const rows = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.totalCount ?? 0) / pageSize));
  return (
    <div>
      <PageHeader
        title="Xe khach hang"
        description="Quan ly xe, so km va lich su bao duong cua khach hang."
        action={
          <ActionButton variant="primary" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Them xe
          </ActionButton>
        }
      />

      <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-[1fr_auto]">
        <Input
          label="Loc theo userId"
          value={userFilter}
          onChange={(event) => setUserFilter(event.target.value)}
          placeholder="Guid khach hang"
        />
        <div className="flex items-end gap-2">
          <ActionButton
            variant="primary"
            onClick={() => {
              setPage(1);
              setAppliedUserId(userFilter.trim() || undefined);
            }}
          >
            <Search className="mr-2 h-4 w-4" /> Loc
          </ActionButton>
          <ActionButton onClick={() => {
            setUserFilter("");
            setAppliedUserId(undefined);
            setPage(1);
          }}>Xoa</ActionButton>
        </div>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => String(row.customerVehicleID)}
        loading={isLoading}
        emptyTitle="Chua co xe"
        enablePagination={false}
      />

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>Tong {data?.totalCount ?? 0} xe</span>
        <div className="flex gap-2">
          <ActionButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Truoc</ActionButton>
          <span className="px-2 py-2">Trang {page}/{totalPages}</span>
          <ActionButton disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Sau</ActionButton>
        </div>
      </div>

      <Modal open={vehicleFormOpen} onClose={closeForm} title={editing ? "Sua xe" : "Them xe"} size="xl" footer={
        <div className="flex justify-end gap-2">
          <ActionButton onClick={closeForm}>Huy</ActionButton>
          <ActionButton variant="primary" type="submit" onClick={handleSubmit(saveVehicle)} disabled={mutations.createVehicle.isPending || mutations.updateVehicle.isPending}>Luu</ActionButton>
        </div>
      }>
        <VehicleFields register={register} errors={errors} brands={brands} />
      </Modal>

      <Modal open={mileageVehicle !== null} onClose={() => setMileageVehicle(null)} title="Cap nhat so km" footer={
        <div className="flex justify-end gap-2">
          <ActionButton onClick={() => setMileageVehicle(null)}>Huy</ActionButton>
          <ActionButton variant="primary" onClick={updateMileage} disabled={mutations.patchMileage.isPending}>Luu</ActionButton>
        </div>
      }>
        <Input label="So km hien tai" type="number" min={0} value={mileage} onChange={(event) => setMileage(event.target.value)} />
      </Modal>

      <Modal open={historyId !== null} onClose={() => setHistoryId(null)} title="Lich su bao duong" size="xl">
        {historyLoading ? <p>Dang tai...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2">Ngay</th>
                  <th>Phieu</th>
                  <th>Km</th>
                  <th>Dich vu</th>
                  <th>Chi phi</th>
                  <th>Khuyen nghi</th>
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
            {history.length === 0 ? <p className="py-6 text-center text-slate-500">Chua co lich su.</p> : null}
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
      <Input label="UserID" required {...register("userID", { required: "Bat buoc" })} error={errors.userID?.message} />
      <Input label="CarID" type="number" min={1} {...register("carID")} />
      <Input label="VIN" required maxLength={50} {...register("vin", { required: "Bat buoc", maxLength: 50 })} error={errors.vin?.message} />
      <Input label="Bien so" maxLength={20} {...register("licensePlate")} />
      <label className="space-y-1">
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Hang xe *</span>
        <select className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900" {...register("brandID", { required: "Bat buoc" })}>
          <option value="">Chon hang</option>
          {brands.map((brand) => {
            const id = brand.brandID ?? brand.id ?? 0;
            return <option key={id} value={id}>{brand.brandName ?? `Brand #${id}`}</option>;
          })}
        </select>
        {errors.brandID?.message ? <p className="text-xs text-red-600">{errors.brandID.message}</p> : null}
      </label>
      <Input label="Dong xe" required maxLength={100} {...register("modelName", { required: "Bat buoc", maxLength: 100 })} error={errors.modelName?.message} />
      <Input label="Nam SX" required type="number" min={1900} max={2100} {...register("modelYear", { required: "Bat buoc" })} error={errors.modelYear?.message} />
      <Input label="Mau" maxLength={50} {...register("color")} />
      <Input label="Km hien tai" type="number" min={0} {...register("currentMileage")} />
      <Input label="Ngay bao duong gan nhat" type="datetime-local" {...register("lastServiceDate")} />
      <Input label="Ngay bao duong tiep theo" type="datetime-local" {...register("nextServiceDate")} />
      <Input label="Km bao duong tiep theo" type="number" min={0} {...register("nextServiceMileage")} />
      <label className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-100">
        <input type="checkbox" {...register("isActive")} />
        Dang hoat dong
      </label>
    </div>
  );
}
