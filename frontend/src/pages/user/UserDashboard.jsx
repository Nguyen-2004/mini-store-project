import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import PageHeading from "../../components/common/PageHeading";
import StatCard from "../../components/common/StatCard";
import OrderTable from "../../components/common/OrderTable";
import { money, orderTotal } from "../../data/mockData";
export default function UserDashboard() {
  const { account, orders } = useStore();
  const mine = orders.filter((o) => o.userId === account.id);
  return (
    <>
      <PageHeading
        eyebrow="NGÀY MỚI TỐT LÀNH"
        title={`Xin chào, ${account.fullName}!`}
      >
        Cùng nhìn lại những đơn hàng của bạn tại Mini Store.
      </PageHeading>
      <div className="welcome-banner">
        <div>
          <span className="eyebrow">MỘT CHÚT QUAN TÂM MỖI NGÀY</span>
          <h2>
            Những điều thiết yếu,
            <br />
            luôn ở ngay đây.
          </h2>
          <Link className="btn btn-primary mt-2" to="/products">
            Khám phá cửa hàng{" "}
            <i aria-hidden="true" className="bi bi-arrow-right ms-2" />
          </Link>
        </div>
        <i aria-hidden="true" className="bi bi-basket2" />
      </div>
      <div className="row g-4 my-1">
        {[
          ["Tổng số đơn hàng", mine.length, "bag"],
          [
            "Đơn đang xử lý",
            mine.filter((o) => o.status === "Đang xử lý").length,
            "clock",
          ],
          [
            "Đơn hoàn thành",
            mine.filter((o) => o.status === "Hoàn thành").length,
            "check2-circle",
          ],
          [
            "Tổng tiền đã mua",
            money(mine.filter((o) => o.status !== "Đã hủy").reduce((sum, order) => sum + orderTotal(order), 0)),
            "wallet2",
          ],
        ].map(([title, value, icon]) => (
          <div className="col-sm-6 col-xl-3" key={title}>
            <StatCard
              title={title}
              value={value}
              icon={icon}
              note="Trong lịch sử mua sắm của bạn"
            />
          </div>
        ))}
      </div>
      <section className="panel mt-4">
        <div className="panel-heading">
          <h2>Đơn hàng gần đây</h2>
          <Link to="/user/orders">
            Xem tất cả <i aria-hidden="true" className="bi bi-arrow-right" />
          </Link>
        </div>
        <OrderTable orders={mine.slice(0, 5)} />
      </section>
    </>
  );
}
