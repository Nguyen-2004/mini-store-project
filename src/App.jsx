import { BrowserRouter, Navigate, Route, Routes, Link } from "react-router-dom";
import StoreProvider from "./context/StoreProvider";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicLayout from "./layouts/PublicLayout";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import Home from "./pages/public/Home";
import Products from "./pages/public/Products";
import ProductDetail from "./pages/public/ProductDetail";
import About from "./pages/public/About";
import Login from "./pages/public/Login";
import UserDashboard from "./pages/user/UserDashboard";
import Profile from "./pages/user/Profile";
import MyOrders from "./pages/user/MyOrders";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageProducts from "./pages/admin/ManageProducts";
import ManageOrders from "./pages/admin/ManageOrders";
export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            <Route
              path="*"
              element={
                <div className="container section-space">
                  <h1>404 · Trang không tồn tại</h1>
                  <Link className="btn btn-primary mt-3" to="/">
                    Về trang chủ
                  </Link>
                </div>
              }
            />
          </Route>
          <Route element={<ProtectedRoute role="user" />}>
            <Route path="user" element={<UserLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="orders" element={<MyOrders />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="orders" element={<ManageOrders />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
