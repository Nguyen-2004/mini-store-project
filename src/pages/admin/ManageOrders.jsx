import { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { statuses } from "../../data/mockData";
import PageHeading from "../../components/common/PageHeading";
import OrderTable from "../../components/common/OrderTable";
export default function ManageOrders() {
  const { orders } = useStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const filtered = orders.filter(
    (o) =>
      (o.id + " " + o.customer)
        .toLocaleLowerCase("vi")
        .includes(search.trim().toLocaleLowerCase("vi")) &&
      (!status || o.status === status),
  );
  return (
    <>
      <PageHeading eyebrow="QUẢN LÝ CỬA HÀNG" title="Quản lý đơn hàng">
        Tra cứu đơn hàng và theo dõi trạng thái xử lý.
      </PageHeading>
      <section className="panel">
        <div className="panel-heading flex-wrap gap-3">
          <input
            className="form-control search-input"
            placeholder="Tìm mã đơn, khách hàng..."
            aria-label="Tìm đơn hàng"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select status-filter"
            aria-label="Lọc trạng thái"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <OrderTable orders={filtered} showCustomer />
      </section>
    </>
  );
}
