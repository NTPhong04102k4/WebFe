import React, { useState } from "react";
import { useForm } from "react-hook-form";

import {
  useInsuranceMutations,
  useInsurancePackages,
  useMyPolicies,
} from "src/query/insurance/useInsuranceQueries";
import { useCustomerVehicles } from "src/query/workshop/useWorkshopQueries";
import { useAuthStore } from "@/stores/authStore";

import shell from "../account-shell.module.scss";

type PolicyForm = {
  customerVehicleID: number;
  packageID: number;
  startDate: string;
  endDate: string;
  premiumAmount: number;
};

export default function MyInsurancePage() {
  const user = useAuthStore((s) => s.user);
  const userID = user?.userID ?? user?.id;

  const { data: polRes, isLoading: polLoading } = useMyPolicies(userID);
  const policies = polRes?.data ?? [];

  const { data: vehiclesRes } = useCustomerVehicles({
    page: 1,
    pageSize: 100,
    userId: userID,
  });
  const vehicles = vehiclesRes?.data ?? [];

  const { data: packages = [] } = useInsurancePackages(undefined);

  const { createPolicy } = useInsuranceMutations();
  const [tab, setTab] = useState<"policies" | "new">("policies");
  const [msg, setMsg] = useState<string | null>(null);

  const policyForm = useForm<PolicyForm>({
    defaultValues: {
      customerVehicleID: 0,
      packageID: 0,
      startDate: "",
      endDate: "",
      premiumAmount: 0,
    },
  });

  const submitPolicy = policyForm.handleSubmit(async (f) => {
    setMsg(null);
    if (!userID || !f.customerVehicleID || !f.packageID) {
      setMsg("Chọn xe và gói bảo hiểm.");
      return;
    }
    try {
      await createPolicy.mutateAsync({
        customerVehicleID: f.customerVehicleID,
        packageID: f.packageID,
        userID,
        startDate: new Date(f.startDate).toISOString(),
        endDate: new Date(f.endDate).toISOString(),
        premiumAmount: Number(f.premiumAmount),
      });
      setMsg("Đã gửi hợp đồng (chờ xử lý).");
      policyForm.reset();
    } catch {
      setMsg("Không tạo được hợp đồng.");
    }
  });

  return (
    <section>
      <h2 className={shell.title}>Bảo hiểm</h2>
      <p className={shell.sub}>
        Xem hợp đồng và mua gói mới.
      </p>

      <div
        className={shell.nav}
        style={{ border: "none", paddingBottom: 0, gap: "0.5rem" }}
      >
        <button
          type="button"
          className={`${shell.btn} ${shell.secondary}`}
          style={
            tab === "policies"
              ? { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }
              : undefined
          }
          onClick={() => setTab("policies")}
        >
          Hợp đồng
        </button>
        <button
          type="button"
          className={`${shell.btn} ${shell.secondary}`}
          style={
            tab === "new"
              ? { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }
              : undefined
          }
          onClick={() => setTab("new")}
        >
          Mua mới
        </button>
      </div>

      {msg && <p className={shell.ok}>{msg}</p>}

      {tab === "policies" && (
        <>
          <h3 className={shell.title} style={{ fontSize: "1.05rem" }}>
            Hợp đồng của tôi
          </h3>
          {polLoading && <p className={shell.sub}>Đang tải…</p>}
          <div className={shell.tableWrap}>
            <table className={shell.table}>
              <thead>
                <tr>
                  <th>Số HĐ</th>
                  <th>Gói</th>
                  <th>Hạn</th>
                  <th>Phí</th>
                  <th>TT</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p.policyID}>
                    <td>{p.policyNumber}</td>
                    <td>{p.packageName ?? "—"}</td>
                    <td>
                      {new Date(p.endDate).toLocaleDateString("vi-VN")}{" "}
                      <span className={shell.badge}>{p.daysToExpire} ngày</span>
                    </td>
                    <td>{p.premiumAmount?.toLocaleString("vi-VN")}</td>
                    <td>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "new" && (
        <div className={shell.card}>
          <h3 className={shell.title} style={{ fontSize: "1rem" }}>
            Tạo hợp đồng (gói & thời hạn)
          </h3>
          <form onSubmit={submitPolicy}>
            <div className={shell.grid}>
              <div className={shell.field}>
                <label>Xe</label>
                <select
                  {...policyForm.register("customerVehicleID", {
                    valueAsNumber: true,
                  })}
                >
                  <option value={0}>— Chọn —</option>
                  {vehicles.map((v) => (
                    <option key={v.customerVehicleID} value={v.customerVehicleID}>
                      {v.vin} · {v.modelName}
                    </option>
                  ))}
                </select>
              </div>
              <div className={shell.field}>
                <label>Gói bảo hiểm</label>
                <select
                  {...policyForm.register("packageID", { valueAsNumber: true })}
                >
                  <option value={0}>— Chọn —</option>
                  {packages.map((pk) => (
                    <option key={pk.packageID} value={pk.packageID}>
                      {pk.companyName} — {pk.packageName} (
                      {pk.basePremium?.toLocaleString("vi-VN")} ₫)
                    </option>
                  ))}
                </select>
              </div>
              <div className={shell.field}>
                <label>Bắt đầu</label>
                <input type="date" {...policyForm.register("startDate")} />
              </div>
              <div className={shell.field}>
                <label>Kết thúc</label>
                <input type="date" {...policyForm.register("endDate")} />
              </div>
              <div className={shell.field}>
                <label>Phí thực trả</label>
                <input
                  type="number"
                  {...policyForm.register("premiumAmount", { valueAsNumber: true })}
                />
              </div>
            </div>
            <button
              type="submit"
              className={`${shell.btn} ${shell.primary}`}
              disabled={createPolicy.isPending}
            >
              Gửi hợp đồng
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
