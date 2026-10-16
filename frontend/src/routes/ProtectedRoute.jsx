import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../context/StoreContext";
export default function ProtectedRoute({ role }) {
  const { account, loading } = useStore();
  if (loading) return <div className="container section-space text-center" role="status">Đang tải dữ liệu…</div>;
  if (!account) return <Navigate to="/login" replace />;
  if (account.role !== role)
    return <Navigate to={`/${account.role}/dashboard`} replace />;
  return <Outlet />;
}
