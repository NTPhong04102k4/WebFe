import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import {
  useCustomerVehicles,
  useWorkshopMutations,
} from "@/query/workshop/useWorkshopQueries";
import { brandCarRouteFn } from "src/services/api/functions/BrandCar/Routes.Fn";
import type { CustomerVehicleViewModel } from "src/services/api/functions/workshop/workshop.types";
import { useAuthStore } from "@/stores/authStore";

type VehicleForm = {
  vin: string;
  licensePlate: string;
  brandID: number;
  modelName: string;
  modelYear: number;
  color: string;
  currentMileage: number;
};

const EMPTY: VehicleForm = {
  vin: "",
  licensePlate: "",
  brandID: 0,
  modelName: "",
  modelYear: new Date().getFullYear(),
  color: "",
  currentMileage: 0,
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20";

export function VehicleSection() {
  const user = useAuthStore((s) => s.user);
  // Customer token không có StaffID nên userID/id = 0; userUUID là định danh thật
  const userId = user?.userUUID || user?.userID || user?.id;

  const { data: brandsRaw = [], isLoading: brandsLoading } = useQuery({
    queryKey: ["brand-cars"],
    queryFn: () => brandCarRouteFn.getBrandsCars(),
    staleTime: 10 * 60_000,
  });

  const brands = useMemo(
    () => brandsRaw.map((b) => ({ id: b.id ?? 0, name: b.brandName ?? "" })),
    [brandsRaw]
  );

  const { data: vehiclesRes, isLoading } = useCustomerVehicles({
    page: 1,
    pageSize: 50,
    userId: userId,
  });
  const vehicles = vehiclesRes?.data ?? [];

  const { createVehicle, updateVehicle } = useWorkshopMutations();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleForm>({ defaultValues: EMPTY });

  const openCreate = () => {
    setEditingId(null);
    reset(EMPTY);
    setFormOpen(true);
  };

  const openEdit = (v: CustomerVehicleViewModel) => {
    setEditingId(v.customerVehicleID);
    reset({
      vin: v.vin,
      licensePlate: v.licensePlate ?? "",
      brandID: v.brandID,
      modelName: v.modelName,
      modelYear: v.modelYear,
      color: v.color ?? "",
      currentMileage: v.currentMileage,
    });
    setFormOpen(true);
  };

  const cancelForm = () => {
    setFormOpen(false);
    setEditingId(null);
    reset(EMPTY);
  };

  const onSubmit = async (values: VehicleForm) => {
    if (!userId) return;
    const body = {
      userID: userId,
      vin: values.vin.trim(),
      licensePlate: values.licensePlate.trim() || null,
      brandID: Number(values.brandID),
      modelName: values.modelName.trim(),
      modelYear: Number(values.modelYear),
      color: values.color.trim() || null,
      currentMileage: Number(values.currentMileage),
      isActive: true,
    };
    if (editingId != null) {
      await updateVehicle.mutateAsync({ id: editingId, body });
    } else {
      await createVehicle.mutateAsync(body);
    }
    cancelForm();
  };

  const isPending = createVehicle.isPending || updateVehicle.isPending;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Xe của tôi</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Quản lý xe để đặt lịch hẹn và theo dõi bảo dưỡng.
          </p>
        </div>
        {!formOpen && (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Thêm xe
          </button>
        )}
      </div>

      {/* Form thêm / sửa */}
      {formOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">
            {editingId != null ? "Chỉnh sửa xe" : "Thêm xe mới"}
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="VIN *" error={errors.vin ? "Bắt buộc" : undefined}>
              <input
                className={inputCls}
                placeholder="VD: JN1TANT31U0000001"
                {...register("vin", { required: true })}
              />
            </Field>

            <Field label="Biển số xe">
              <input
                className={inputCls}
                placeholder="VD: 51A-12345"
                {...register("licensePlate")}
              />
            </Field>

            <Field label="Hãng xe *" error={errors.brandID ? "Chọn hãng" : undefined}>
              <select
                className={inputCls}
                disabled={brandsLoading}
                {...register("brandID", { valueAsNumber: true, validate: (v) => v > 0 || "Chọn hãng" })}
              >
                <option value={0}>— Chọn hãng —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Dòng xe *" error={errors.modelName ? "Bắt buộc" : undefined}>
              <input
                className={inputCls}
                placeholder="VD: Camry"
                {...register("modelName", { required: true })}
              />
            </Field>

            <Field label="Năm sản xuất">
              <input
                type="number"
                className={inputCls}
                min={1980}
                max={new Date().getFullYear() + 1}
                {...register("modelYear", { valueAsNumber: true })}
              />
            </Field>

            <Field label="Màu sắc">
              <input
                className={inputCls}
                placeholder="VD: Trắng ngọc trai"
                {...register("color")}
              />
            </Field>

            <Field label="Km hiện tại">
              <input
                type="number"
                className={inputCls}
                min={0}
                {...register("currentMileage", { valueAsNumber: true })}
              />
            </Field>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Đang lưu..." : editingId != null ? "Lưu thay đổi" : "Thêm xe"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="rounded-lg border px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Danh sách xe */}
      <div className="mt-5">
        {isLoading && (
          <p className="text-sm text-slate-400">Đang tải danh sách xe...</p>
        )}

        {!isLoading && vehicles.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center">
            <p className="text-sm text-slate-400">Chưa có xe nào. Nhấn "+ Thêm xe" để đăng ký.</p>
          </div>
        )}

        {vehicles.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {vehicles.map((v) => (
              <div
                key={v.customerVehicleID}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 leading-tight">
                      {v.brandName} {v.modelName}{" "}
                      <span className="text-xs font-normal text-slate-500">{v.modelYear}</span>
                    </p>
                    {v.licensePlate && (
                      <p className="mt-0.5 text-xs text-slate-500">{v.licensePlate}</p>
                    )}
                    <p className="mt-0.5 text-xs text-slate-400">VIN: {v.vin}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEdit(v)}
                    className="shrink-0 rounded border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Sửa
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                  <span>{v.currentMileage.toLocaleString("vi-VN")} km</span>
                  {v.color && <span>· {v.color}</span>}
                  {v.nextServiceDate && (
                    <span className="ml-auto text-amber-600">
                      Bảo dưỡng: {new Date(v.nextServiceDate).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
