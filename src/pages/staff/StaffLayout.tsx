import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

import staff from "./staff-dashboard.module.scss";

const nav = [
  { to: "/staff/workshop", label: "Xưởng (lịch & phiếu)" },
  { to: "/staff/insurance", label: "Bảo hiểm" },
];

export default function StaffLayout() {
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

      <div className={staff.shell}>
        <aside className={staff.sidebar} aria-label="Khu vực staff">
          <nav className={staff.sideNav}>
            {nav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${staff.sideNavLink} ${isActive ? staff.sideNavLinkActive : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className={staff.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
