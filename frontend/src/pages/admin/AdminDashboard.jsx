import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { money, orderTotal } from "../../data/mockData";
import PageHeading from "../../components/common/PageHeading";
import StatCard from "../../components/common/StatCard";
import OrderTable from "../../components/common/OrderTable";
export default function AdminDashboard() {
  const { users, products, orders } = useStore();
  const revenue = orders
    .filter((o) => o.status === "Hoàn thành")
    .reduce((sum, o) => sum + orderTotal(o), 0);
  const monthly = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const key = date.toISOString().slice(0, 7);
    const amount = orders.filter((order) => order.date?.startsWith(key) && order.status !== "Đã hủy").reduce((sum, order) => sum + orderTotal(order), 0);
    return { label: date.toLocaleDateString("vi-VN", { month: "short" }), amount };
  });
  const maxRevenue = Math.max(...monthly.map((item) => item.amount), 1);
  return (
    <>
      <PageHeading
        eyebrow="TỔNG QUAN CỬA HÀNG"
        title="Một ngày kinh doanh tốt lành."
        action={
          <Link className="btn btn-primary" to="/admin/products">
            <i aria-hidden="true" className="bi bi-box-seam me-2" />
            Quản lý sản phẩm
          </Link>
        }
      >
        Mọi thông tin quan trọng, trong một góc nhìn.
      </PageHeading>
      <div className="row g-4">
        {[
          ["Total Users", users.length, "people", "Tài khoản trong cửa hàng"],
          [
            "Total Products",
            products.length,
            "box-seam",
            "Sản phẩm trong danh mục",
          ],
          ["Total Orders", orders.length, "receipt", "Tất cả trạng thái"],
          ["Revenue", money(revenue), "wallet2", "Từ đơn đã hoàn thành"],
        ].map(([title, value, icon, note]) => (
          <div className="col-sm-6 col-xl-3" key={title}>
            <StatCard title={title} value={value} icon={icon} note={note} />
          </div>
        ))}
      </div>
      <section className="panel mt-4 p-4">
        <div className="d-flex justify-content-between align-items-start"><div><h2 className="h5 mb-1">Doanh thu theo tháng</h2><span className="small text-secondary">Dữ liệu đơn hàng mẫu</span></div><i className="bi bi-bar-chart-line fs-4 text-success"/></div>
        <div className="sales-chart" role="img" aria-label="Biểu đồ doanh thu sáu tháng gần nhất">{monthly.map((item) => <div className="sales-bar-wrap" key={item.label}><span className="small text-secondary">{money(item.amount)}</span><div className="sales-bar" style={{ height: (Math.max(item.amount / maxRevenue * 100, 4)) + "%" }}/><small>{item.label}</small></div>)}</div>
      </section>
      <section className="panel mt-4">
        <div className="panel-heading">
          <div>
            <h2>Đơn hàng gần đây</h2>
            <small className="text-secondary">Recent Orders</small>
          </div>
          <Link to="/admin/orders">
            Xem tất cả <i aria-hidden="true" className="bi bi-arrow-right" />
          </Link>
        </div>
        <OrderTable orders={orders.slice(0, 5)} showCustomer />
      </section>
      <section className="panel mt-4">
        <div className="panel-heading">
          <div>
            <h2>Người dùng gần đây</h2>
            <small className="text-secondary">Recent Users</small>
          </div>
          <Link to="/admin/users">
            Quản lý người dùng{" "}
            <i aria-hidden="true" className="bi bi-arrow-right" />
          </Link>
        </div>
        <div className="row g-0">
          {users
            .slice(-4)
            .reverse()
            .map((user) => (
              <div className="col-md-6 col-xl-3" key={user.id}>
                <div className="recent-user">
                  <span className="avatar">{user.fullName.charAt(0)}</span>
                  <div>
                    <strong>{user.fullName}</strong>
                    <small>{user.email}</small>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>
    </>
  );
}
