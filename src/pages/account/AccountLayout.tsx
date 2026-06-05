import React from "react";
import { NavLink, Outlet } from "react-router-dom";

import shell from "./account-shell.module.scss";

const links = [
  { to: "/account/garage", label: "Xe của tôi" },
  { to: "/account/orders", label: "Đơn hàng" },
  { to: "/account/appointments", label: "Lịch hẹn" },
  { to: "/account/work-orders", label: "Phiếu sửa chữa" },
  { to: "/account/insurance", label: "Bảo hiểm" },
  { to: "/account/reviews", label: "Đánh giá" },
];

export default function AccountLayout() {
  return (
    <div className={shell.shell}>
      <h1 className={shell.title}>Tài khoản dịch vụ</h1>
      <p className={shell.sub}>
        Quản lý xe, lịch hẹn xưởng, phiếu công việc và bảo hiểm. Giao diện tối ưu
        cho điện thoại, máy tính bảng và màn hình lớn.
      </p>
      <nav className={shell.nav} aria-label="Tài khoản">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${shell.navLink} ${isActive ? shell.navLinkActive : ""}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
