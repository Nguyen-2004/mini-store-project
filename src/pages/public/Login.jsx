import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
export default function Login() {
  const { account, login } = useStore();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  if (account) return <Navigate to={`/${account.role}/dashboard`} replace />;
  function submit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const role = login(values.get("username").trim(), values.get("password"));
    if (role) navigate(`/${role}/dashboard`, { replace: true });
    else setError("Tên đăng nhập hoặc mật khẩu không đúng.");
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
          <label className="form-label" htmlFor="username">
            Tên đăng nhập
          </label>
          <input
            id="username"
            name="username"
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
          <button className="btn btn-primary w-100 py-3">
            Đăng nhập{" "}
            <i aria-hidden="true" className="bi bi-arrow-right ms-2" />
          </button>
        </form>
        <div className="demo-accounts mt-4">
          <strong>
            <i aria-hidden="true" className="bi bi-info-circle me-2" />
            Tài khoản trải nghiệm
          </strong>
          <div>
            User <code>user / 123</code>
          </div>
          <div>
            Admin <code>admin / 123</code>
          </div>
          <small>Đăng nhập giả lập, không cần đăng ký.</small>
        </div>
      </section>
    </div>
  );
}
