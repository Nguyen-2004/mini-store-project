import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../context/StoreContext";
export default function ProtectedRoute({ role }) {
  const { account } = useStore();
  if (!account) return <Navigate to="/login" replace />;
  if (account.role !== role)
    return <Navigate to={`/${account.role}/dashboard`} replace />;
  return <Outlet />;
}
