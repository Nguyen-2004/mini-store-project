import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";

export default function Register() {
  const { account, register, loading } = useStore();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (loading) return <div className="container section-space text-center">Đang tải…</div>;
  if (account) return <Navigate to={`/${account.role}/dashboard`} replace />;
  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    const form = Object.fromEntries(new FormData(event.currentTarget));
    const ok = await register(form);
    if (ok) navigate("/user/dashboard", { replace: true });
    else setError("Đăng ký chưa thành công. Hãy kiểm tra thông tin và thử lại.");
    setBusy(false);
  }
  return <div className="container section-space"><section className="panel p-4 mx-auto" style={{ maxWidth: 560 }}><h1 className="h3">Tạo tài khoản</h1><p className="text-secondary">Đăng ký để lưu giỏ hàng và theo dõi đơn.</p>{error && <div role="alert" className="alert alert-danger">{error}</div>}<form onSubmit={submit}>{[["fullName","Họ tên","text"],["username","Tên đăng nhập","text"],["email","Email","email"],["phone","Số điện thoại","tel"],["password","Mật khẩu","password"]].map(([name,label,type])=><div className="mb-3" key={name}><label className="form-label" htmlFor={name}>{label}</label><input className="form-control" id={name} name={name} type={type} required={name!=="phone"} minLength={name==="password"?8:undefined} autoComplete={name==="password"?"new-password":undefined}/></div>)}<button className="btn btn-primary w-100" disabled={busy}>Đăng ký</button></form><p className="mt-3 mb-0">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p></section></div>;
}
