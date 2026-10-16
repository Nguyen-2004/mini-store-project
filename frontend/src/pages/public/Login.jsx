import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
export default function Login() {
  const { account, login, loading } = useStore();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  if (loading) return <div className="container section-space text-center">Đang tải…</div>;
  if (account) return <Navigate to={`/${account.role}/dashboard`} replace />;
  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError("");
    const values = new FormData(event.currentTarget);
    const role = await login(values.get("identifier").trim(), values.get("password"));
    if (role) navigate(`/${role}/dashboard`, { replace: true });
    else setError("Không đăng nhập được. Hãy kiểm tra thông tin và thử lại.");
    setBusy(false);
  }
  return (
    <div className="login-section container">
      <div className="login-story">
        <span className="pill">KHÔNG GIAN CỦA BẠN</span>
        <h1>
          Chào bạn,
          <br />
          mừng trở lại<span className="text-success">.</span>
        </h1>
        <p>
          Theo dõi đơn hàng, chăm chút hồ sơ
          <br />
          và kết nối cùng Mini Store.
        </p>
        <i aria-hidden="true" className="bi bi-shop-window" />
      </div>
      <section className="login-card">
        <div className="eyebrow">MINI STORE</div>
        <h2 className="mt-2">Đăng nhập</h2>
        <p className="text-secondary mb-4">
          Vào không gian dành riêng cho bạn.
        </p>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={submit}>
          <label className="form-label" htmlFor="identifier">
            Email hoặc tên đăng nhập
          </label>
          <input
            id="identifier"
            name="identifier"
            className="form-control mb-3"
            autoComplete="username"
            required
          />
          <label className="form-label" htmlFor="password">
            Mật khẩu
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-control mb-4"
            autoComplete="current-password"
            required
          />
          <button className="btn btn-primary w-100 py-3" disabled={busy}>
            Đăng nhập{" "}
            <i aria-hidden="true" className="bi bi-arrow-right ms-2" />
          </button>
        </form>
        <p className="mt-4 mb-0">Chưa có tài khoản? <a href="/register">Đăng ký</a></p>
      </section>
    </div>
  );
}
