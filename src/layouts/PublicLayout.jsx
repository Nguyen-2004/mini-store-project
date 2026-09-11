import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import Brand from "../components/common/Brand";
import { useStore } from "../context/StoreContext";
export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { account, logout } = useStore();
  return (
    <>
      <div className="announcement">
        Một chút tươi mới, mỗi ngày.{" "}
        <span className="ms-3">Cửa hàng nhỏ · Tiện ích lớn</span>
      </div>
      <header className="public-header">
        <nav className="container navbar navbar-expand-md py-3">
          <Brand />
          <button
            className="navbar-toggler"
            aria-label="Mở menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <i aria-hidden="true" className="bi bi-list" />
          </button>
          <div className={`collapse navbar-collapse ${open ? "show" : ""}`}>
            <div
              className="navbar-nav mx-auto gap-md-4"
              onClick={() => setOpen(false)}
            >
              <NavLink className="nav-link" to="/" end>
                Trang chủ
              </NavLink>
              <NavLink className="nav-link" to="/products">
                Sản phẩm
              </NavLink>
              <NavLink className="nav-link" to="/about">
                Về chúng tôi
              </NavLink>
            </div>
            <div className="d-flex gap-2">
              {account ? (
                <>
                  <Link
                    className="btn btn-primary"
                    to={`/${account.role}/dashboard`}
                  >
                    Không gian của tôi
                  </Link>
                  <button
                    className="btn btn-light"
                    onClick={logout}
                    aria-label="Đăng xuất"
                  >
                    <i aria-hidden="true" className="bi bi-box-arrow-right" />
                  </button>
                </>
              ) : (
                <Link className="btn btn-primary" to="/login">
                  Đăng nhập{" "}
                  <i aria-hidden="true" className="bi bi-arrow-right ms-2" />
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <div className="row gy-4">
            <div className="col-md-6">
              <Brand />
              <p className="mt-3 text-secondary">
                Những điều thiết yếu, cho một ngày tốt lành.
              </p>
            </div>
            <div className="col-6 col-md-3">
              <h2 className="h6">Khám phá</h2>
              <Link to="/products">Sản phẩm</Link>
              <Link to="/about">Về Mini Store</Link>
            </div>
            <div className="col-6 col-md-3">
              <h2 className="h6">Không gian của bạn</h2>
              <Link to="/login">Đăng nhập</Link>
              <span className="small text-secondary">Dự án môn DevOps</span>
            </div>
          </div>
          <div className="footer-bottom">
            © 2026 Mini Store <span>React · Vite · Docker</span>
          </div>
        </div>
      </footer>
    </>
  );
}
