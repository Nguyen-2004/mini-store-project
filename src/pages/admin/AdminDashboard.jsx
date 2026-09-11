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
