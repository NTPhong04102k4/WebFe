import React, { useState } from "react";

import {
  useClaimsList,
  useExpiringPolicies,
  useInsuranceMutations,
} from "src/query/insurance/useInsuranceQueries";

import staff from "../staff-dashboard.module.scss";

export function StaffInsurancePanel() {
  const [within, setWithin] = useState(30);
  const { data: expiring = [], isLoading } = useExpiringPolicies(within, true);

  const { data: claimsRes } = useClaimsList(1, 40);
  const claims = claimsRes?.data ?? [];

  const { patchClaimStatus } = useInsuranceMutations();
  const [msg, setMsg] = useState<string | null>(null);

  const onClaimStatus = async (
    id: number,
    status: string,
    approvedAmount?: number
  ) => {
    setMsg(null);
    try {
      await patchClaimStatus.mutateAsync({
        id,
        body: { status, approvedAmount, notes: "Cập nhật từ staff portal" },
      });
      setMsg("Đã cập nhật yêu cầu bồi thường.");
    } catch {
      setMsg("Cập nhật thất bại (cần quyền Staff).");
    }
  };

  return (
    <div>
      <p className={staff.note}>
        Hợp đồng sắp hết hạn và xử lý claim — chỉ Admin / SuperAdmin / Staff.
      </p>
      {msg && <p className={staff.ok}>{msg}</p>}

      <div className={staff.card}>
        <h3 className={staff.title}>Hợp đồng sắp hết hạn</h3>
        <div className={staff.field} style={{ maxWidth: 220 }}>
          <label htmlFor="within">Trong số ngày</label>
          <input
            id="within"
            type="number"
            min={1}
            value={within}
            onChange={(e) => setWithin(Number(e.target.value) || 30)}
          />
        </div>
        {isLoading && <p>Đang tải…</p>}
        <div className={staff.tableWrap}>
          <table className={staff.table}>
            <thead>
              <tr>
                <th>Số HĐ</th>
                <th>Khách</th>
                <th>Hết hạn</th>
                <th>Còn (ngày)</th>
              </tr>
            </thead>
            <tbody>
              {expiring.map((p) => (
                <tr key={p.policyID}>
                  <td>{p.policyNumber}</td>
                  <td>{p.ownerFullName ?? "—"}</td>
                  <td>{new Date(p.endDate).toLocaleDateString("vi-VN")}</td>
                  <td>{p.daysToExpire}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={staff.card}>
        <h3 className={staff.title}>Yêu cầu bồi thường — xử lý trạng thái</h3>
        <div className={staff.tableWrap}>
          <table className={staff.table}>
            <thead>
              <tr>
                <th>Mã</th>
                <th>TT hiện tại</th>
                <th>Số tiền</th>
                <th>Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.claimID}>
                  <td>{c.claimNumber}</td>
                  <td>{c.status}</td>
                  <td>{c.claimAmount?.toLocaleString("vi-VN")}</td>
                  <td>
                    <select
                      aria-label="Trạng thái claim"
                      defaultValue=""
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "Approved") {
                          const amt = window.prompt(
                            "Số tiền duyệt (optional)",
                            String(c.claimAmount)
                          );
                          onClaimStatus(
                            c.claimID,
                            v,
                            amt ? Number(amt) : undefined
                          );
                        } else if (v) {
                          onClaimStatus(c.claimID, v);
                        }
                      }}
                    >
                      <option value="">Đổi trạng thái…</option>
                      <option value="UnderReview">UnderReview</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
