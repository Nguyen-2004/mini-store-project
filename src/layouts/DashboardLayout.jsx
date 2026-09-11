import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import Brand from "../components/common/Brand";
import { useStore } from "../context/StoreContext";
const adminLinks = [
  ["dashboard", "grid", "Tổng quan"],
  ["users", "people", "Người dùng"],
  ["products", "box-seam", "Sản phẩm"],
  ["orders", "receipt", "Đơn hàng"],
];
const userLinks = [
  ["dashboard", "grid", "Tổng quan"],
  ["profile", "person", "Hồ sơ cá nhân"],
  ["orders", "bag", "Đơn hàng của tôi"],
];
export default function DashboardLayout({ role }) {
  const [open, setOpen] = useState(false);
  const { account, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const links = role === "admin" ? adminLinks : userLinks;
  const title =
    links.find(([path]) => location.pathname.endsWith(path))?.[2] ||
    "Tổng quan";
  return (
    <div className="dashboard-shell">
      {open && (
        <button
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Đóng menu"
        />
      )}
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="d-flex align-items-center justify-content-between">
          <Brand />
          <button
            className="btn d-lg-none"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
          >
            <i aria-hidden="true" className="bi bi-x-lg" />
          </button>
        </div>
        <p className="sidebar-label">
          {role === "admin" ? "QUẢN LÝ CỬA HÀNG" : "TÀI KHOẢN CỦA BẠN"}
        </p>
        <nav className="sidebar-nav">
          {links.map(([path, icon, label]) => (
            <NavLink
              key={path}
              to={`/${role}/${path}`}
              onClick={() => setOpen(false)}
            >
              <i aria-hidden="true" className={`bi bi-${icon}`} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-note">
            <i aria-hidden="true" className="bi bi-flower1" />
            <strong>Mỗi ngày, một điều tốt.</strong>
            <small>Cùng Mini Store chăm chút những điều nhỏ bé.</small>
          </div>
          <NavLink to="/">
            <i aria-hidden="true" className="bi bi-arrow-left" /> Về cửa hàng
          </NavLink>
          <button
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            <i aria-hidden="true" className="bi bi-box-arrow-right" /> Đăng xuất
          </button>
        </div>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn d-lg-none"
              aria-label="Mở sidebar"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <i aria-hidden="true" className="bi bi-list" />
            </button>
            <span className="text-secondary small">
              Không gian {role === "admin" ? "quản trị" : "cá nhân"}{" "}
              <span className="mx-2">/</span>{" "}
              <strong className="text-dark">{title}</strong>
            </span>
          </div>
          <div className="account-chip">
            <span className="avatar">{account.fullName.charAt(0)}</span>
            <div>
              <strong>{account.fullName}</strong>
              <small>{role === "admin" ? "Quản trị viên" : "Thành viên"}</small>
            </div>
          </div>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
        <div className="dashboard-foot">
          Mini Store · Không gian {role === "admin" ? "quản trị" : "cá nhân"}
          <span>Dữ liệu minh họa</span>
        </div>
      </div>
    </div>
  );
}
