import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import {
  useCustomerVehicles,
  useWorkshopMutations,
} from "src/query/workshop/useWorkshopQueries";
import { useAppSelector } from "src/redux/hook";
import { selectUser } from "src/redux/Slice/AuthSlice";
import { brandCarRouteFn } from "src/services/api/functions/BrandCar/Routes.Fn";
import type { CustomerVehicleRequest } from "src/services/api/functions/workshop/workshop.types";

import shell from "../account-shell.module.scss";

type FormValues = {
  vin: string;
  licensePlate: string;
  brandID: number;
  modelName: string;
  modelYear: number;
  color: string;
  currentMileage: number;
};

const defaultValues: FormValues = {
  vin: "",
  licensePlate: "",
  brandID: 0,
  modelName: "",
  modelYear: new Date().getFullYear(),
  color: "",
  currentMileage: 0,
};

export default function GaragePage() {
  const user = useAppSelector(selectUser);
  const userID = user && "userID" in user ? user.userID : undefined;

  const { data: brands = [], isLoading: loadingBrands } = useQuery({
    queryKey: ["brand-cars"],
    queryFn: () => brandCarRouteFn.getBrandsCars(),
    staleTime: 10 * 60_000,
  });

  const { data: list, isLoading, error } = useCustomerVehicles({
    page: 1,
    pageSize: 50,
    userId: userID,
  });

  const { createVehicle, updateVehicle } = useWorkshopMutations();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues });

  const vehicles = list?.data ?? [];

  const brandOptions = useMemo(
    () =>
      brands.map((b) => ({
        id: b.id,
        name: b.brandName ?? "",
      })),
    [brands]
  );

  const onSubmit = async (values: FormValues) => {
    setMsg(null);
    if (!userID) {
      setMsg("Không tìm thấy userID. Vui lòng đăng nhập lại.");
      return;
    }
    if (!values.brandID) {
      setMsg("Chọn hãng xe.");
      return;
    }

    const body: CustomerVehicleRequest = {
      userID,
      vin: values.vin.trim(),
      licensePlate: values.licensePlate.trim() || undefined,
      brandID: values.brandID,
      modelName: values.modelName.trim(),
      modelYear: Number(values.modelYear),
      color: values.color.trim() || undefined,
      currentMileage: Number(values.currentMileage),
      isActive: true,
    };

    try {
      if (editingId != null) {
        await updateVehicle.mutateAsync({ id: editingId, body });
        setMsg("Đã cập nhật xe.");
      } else {
        await createVehicle.mutateAsync(body);
        setMsg("Đã thêm xe.");
      }
      reset(defaultValues);
      setEditingId(null);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Lỗi khi lưu";
      setMsg(msg);
    }
  };

  const startEdit = (v: (typeof vehicles)[0]) => {
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
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset(defaultValues);
    setMsg(null);
  };

  return (
    <section>
      <h2 className={shell.title}>Garage — xe đăng ký</h2>
      <p className={shell.sub}>
        Thêm hoặc chỉnh sửa xe để đặt lịch hẹn và mua bảo hiểm.
      </p>

      <div className={shell.card}>
        <h3 className={shell.title} style={{ fontSize: "1rem" }}>
          {editingId != null ? "Sửa xe" : "Thêm xe mới"}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={shell.grid}>
            <div className={shell.field}>
              <label htmlFor="vin">VIN *</label>
              <input
                id="vin"
                {...register("vin", { required: true })}
                autoComplete="off"
              />
              {errors.vin && <p className={shell.err}>Bắt buộc</p>}
            </div>
            <div className={shell.field}>
              <label htmlFor="licensePlate">Biển số</label>
              <input id="licensePlate" {...register("licensePlate")} />
            </div>
            <div className={shell.field}>
              <label htmlFor="brandID">Hãng *</label>
              <select
                id="brandID"
                {...register("brandID", { valueAsNumber: true, required: true })}
                disabled={loadingBrands}
              >
                <option value={0}>— Chọn —</option>
                {brandOptions.map((b) => (
                  <option key={b.id} value={b.id ?? 0}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={shell.field}>
              <label htmlFor="modelName">Dòng xe *</label>
              <input id="modelName" {...register("modelName", { required: true })} />
            </div>
            <div className={shell.field}>
              <label htmlFor="modelYear">Năm SX *</label>
              <input
                id="modelYear"
                type="number"
                {...register("modelYear", { valueAsNumber: true })}
              />
            </div>
            <div className={shell.field}>
              <label htmlFor="color">Màu</label>
              <input id="color" {...register("color")} />
            </div>
            <div className={shell.field}>
              <label htmlFor="mile">Km hiện tại *</label>
              <input
                id="mile"
                type="number"
                {...register("currentMileage", { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className={shell.btnRow}>
            <button
              type="submit"
              className={`${shell.btn} ${shell.primary}`}
              disabled={createVehicle.isPending || updateVehicle.isPending}
            >
              {editingId != null ? "Lưu thay đổi" : "Thêm xe"}
            </button>
            {editingId != null && (
              <button
                type="button"
                className={`${shell.btn} ${shell.secondary}`}
                onClick={cancelEdit}
              >
                Hủy sửa
              </button>
            )}
          </div>
          {msg && <p className={shell.ok}>{msg}</p>}
        </form>
      </div>

      <h3 className={shell.title} style={{ fontSize: "1.05rem", marginTop: "1.5rem" }}>
        Danh sách xe
      </h3>
      {isLoading && <p className={shell.sub}>Đang tải…</p>}
      {error && (
        <p className={shell.err}>Không tải được danh sách. Kiểm tra mạng hoặc đăng nhập.</p>
      )}
      {!isLoading && vehicles.length === 0 && (
        <p className={shell.sub}>Chưa có xe nào. Thêm xe phía trên.</p>
      )}
      <div className={shell.grid}>
        {vehicles.map((v) => (
          <div key={v.customerVehicleID} className={shell.card}>
            <p style={{ margin: "0 0 0.35rem", fontWeight: 700 }}>
              {v.brandName ?? "—"} {v.modelName}{" "}
              <span className={shell.badge}>{v.modelYear}</span>
            </p>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
              VIN: {v.vin}
              {v.licensePlate ? ` · ${v.licensePlate}` : ""}
            </p>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>
              {v.currentMileage.toLocaleString()} km
            </p>
            <div className={shell.btnRow}>
              <button
                type="button"
                className={`${shell.btn} ${shell.secondary}`}
                onClick={() => startEdit(v)}
              >
                Sửa
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
