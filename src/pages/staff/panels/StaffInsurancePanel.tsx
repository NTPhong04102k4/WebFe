import React, { useState } from "react";

import { useExpiringPolicies } from "src/query/insurance/useInsuranceQueries";

import staff from "../staff-dashboard.module.scss";

export function StaffInsurancePanel() {
  const [within, setWithin] = useState(30);
  const { data: expiring = [], isLoading } = useExpiringPolicies(within, true);

  return (
    <div>
      <p className={staff.note}>
        Hợp đồng sắp hết hạn — chỉ Admin / SuperAdmin / Staff.
      </p>

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
    </div>
  );
}
