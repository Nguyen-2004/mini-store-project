import { useStore } from "../../context/StoreContext";
import PageHeading from "../../components/common/PageHeading";
import OrderTable from "../../components/common/OrderTable";
export default function MyOrders() {
  const { account, orders } = useStore();
  return (
    <>
      <PageHeading eyebrow="LỊCH SỬ MUA SẮM" title="Đơn hàng của tôi">
        Theo dõi thông tin và trạng thái từng đơn hàng.
      </PageHeading>
      <section className="panel">
        <OrderTable orders={orders.filter((o) => o.userId === account.id)} />
      </section>
    </>
  );
}
