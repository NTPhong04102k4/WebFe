import React, { useState } from "react";
import { useForm } from "react-hook-form";

import {
  useClaimsList,
  useInsuranceMutations,
  useInsurancePackages,
  useMyPolicies,
} from "src/query/insurance/useInsuranceQueries";
import { useCustomerVehicles } from "src/query/workshop/useWorkshopQueries";
import { useAppSelector } from "src/redux/hook";
import { selectUser } from "src/redux/Slice/AuthSlice";

import shell from "../account-shell.module.scss";

type PolicyForm = {
  customerVehicleID: number;
  packageID: number;
  startDate: string;
  endDate: string;
  premiumAmount: number;
};

type ClaimForm = {
  policyID: number;
  incidentDate: string;
  reportedDate: string;
  description: string;
  claimAmount: number;
  workOrderID: string;
};

export default function MyInsurancePage() {
  const user = useAppSelector(selectUser);
  const userID = user && "userID" in user ? user.userID : undefined;

  const { data: polRes, isLoading: polLoading } = useMyPolicies(userID);
  const policies = polRes?.data ?? [];

  const { data: vehiclesRes } = useCustomerVehicles({
    page: 1,
    pageSize: 100,
    userId: userID,
  });
  const vehicles = vehiclesRes?.data ?? [];

  const { data: packages = [] } = useInsurancePackages(undefined);
  const { data: claimsRes } = useClaimsList({ page: 1, pageSize: 30 });
  const claims = claimsRes?.data ?? [];

  const { createPolicy, createClaim } = useInsuranceMutations();
  const [tab, setTab] = useState<"policies" | "new" | "claims">("policies");
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

  const claimForm = useForm<ClaimForm>({
    defaultValues: {
      policyID: 0,
      incidentDate: "",
      reportedDate: new Date().toISOString().slice(0, 10),
      description: "",
      claimAmount: 0,
      workOrderID: "",
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

  const submitClaim = claimForm.handleSubmit(async (f) => {
    setMsg(null);
    if (!f.policyID) {
      setMsg("Chọn hợp đồng.");
      return;
    }
    try {
      await createClaim.mutateAsync({
        policyID: f.policyID,
        workOrderID: f.workOrderID ? Number(f.workOrderID) : undefined,
        incidentDate: new Date(f.incidentDate).toISOString(),
        reportedDate: new Date(f.reportedDate).toISOString(),
        description: f.description,
        claimAmount: Number(f.claimAmount),
      });
      setMsg("Đã gửi yêu cầu bồi thường.");
      claimForm.reset();
    } catch {
      setMsg("Không gửi được yêu cầu.");
    }
  });

  return (
    <section>
      <h2 className={shell.title}>Bảo hiểm</h2>
      <p className={shell.sub}>
        Xem hợp đồng, mua gói mới và gửi yêu cầu bồi thường.
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
        <button
          type="button"
          className={`${shell.btn} ${shell.secondary}`}
          style={
            tab === "claims"
              ? { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }
              : undefined
          }
          onClick={() => setTab("claims")}
        >
          Bồi thường
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

      {tab === "claims" && (
        <>
          <div className={shell.card}>
            <h3 className={shell.title} style={{ fontSize: "1rem" }}>
              Gửi yêu cầu bồi thường
            </h3>
            <form onSubmit={submitClaim}>
              <div className={shell.grid}>
                <div className={shell.field}>
                  <label>Hợp đồng</label>
                  <select
                    {...claimForm.register("policyID", { valueAsNumber: true })}
                  >
                    <option value={0}>— Chọn —</option>
                    {policies.map((p) => (
                      <option key={p.policyID} value={p.policyID}>
                        {p.policyNumber} — {p.packageName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={shell.field}>
                  <label>Ngày sự cố</label>
                  <input type="datetime-local" {...claimForm.register("incidentDate")} />
                </div>
                <div className={shell.field}>
                  <label>Ngày báo cáo</label>
                  <input type="date" {...claimForm.register("reportedDate")} />
                </div>
                <div className={shell.field}>
                  <label>Số tiền yêu cầu</label>
                  <input
                    type="number"
                    {...claimForm.register("claimAmount", { valueAsNumber: true })}
                  />
                </div>
                <div className={shell.field}>
                  <label>Phiếu sửa (tuỳ chọn)</label>
                  <input {...claimForm.register("workOrderID")} placeholder="ID" />
                </div>
                <div className={shell.field} style={{ gridColumn: "1 / -1" }}>
                  <label>Mô tả</label>
                  <textarea {...claimForm.register("description")} />
                </div>
              </div>
              <button
                type="submit"
                className={`${shell.btn} ${shell.primary}`}
                disabled={createClaim.isPending}
              >
                Gửi yêu cầu
              </button>
            </form>
          </div>

          <h3 className={shell.title} style={{ fontSize: "1.05rem", marginTop: "1.5rem" }}>
            Yêu cầu đã gửi
          </h3>
          <div className={shell.tableWrap}>
            <table className={shell.table}>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Trạng thái</th>
                  <th>Số tiền</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.claimID}>
                    <td>{c.claimNumber}</td>
                    <td>
                      <span className={shell.badge}>{c.status}</span>
                    </td>
                    <td>{c.claimAmount?.toLocaleString("vi-VN")}</td>
                    <td>
                      {new Date(c.reportedDate).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
