import React, { useState } from "react";
import { Link } from "react-router-dom";

import { StaffWorkshopPanel } from "./panels/StaffWorkshopPanel";
import { StaffInsurancePanel } from "./panels/StaffInsurancePanel";
import staff from "./staff-dashboard.module.scss";

type Tab = "workshop" | "insurance";

export default function StaffDashboard() {
  const [tab, setTab] = useState<Tab>("workshop");

  return (
    <div className={staff.wrap}>
      <header className={staff.topbar}>
        <span className={staff.brand}>Staff — vận hành xưởng &amp; BH</span>
        <Link
          to="/home"
          style={{ color: "#93c5fd", fontSize: "0.9rem", fontWeight: 600 }}
        >
          Về trang chủ
        </Link>
        <p className={staff.hint}>
          Chỉ tài khoản Admin / SuperAdmin / Staff. Tài khoản thợ (Technician)
          không vào được khu vực này.
        </p>
      </header>

      <div className={staff.body}>
        <div className={staff.tabs}>
          <button
            type="button"
            className={`${staff.tab} ${tab === "workshop" ? staff.tabActive : ""}`}
            onClick={() => setTab("workshop")}
          >
            Xưởng (lịch &amp; phiếu)
          </button>
          <button
            type="button"
            className={`${staff.tab} ${tab === "insurance" ? staff.tabActive : ""}`}
            onClick={() => setTab("insurance")}
          >
            Bảo hiểm
          </button>
        </div>

        {tab === "workshop" && <StaffWorkshopPanel />}
        {tab === "insurance" && <StaffInsurancePanel />}
      </div>
    </div>
  );
}
