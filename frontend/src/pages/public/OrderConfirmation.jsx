import { Link, useParams } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { money, orderTotal } from "../../data/mockData";
export default function OrderConfirmation() {
  const { id } = useParams();
  const { orders } = useStore();
  const order = orders.find((item) => item.id === id);
  if (!order) return <div className="container section-space"><h1>Không tìm thấy đơn hàng</h1><Link to="/products">Về cửa hàng</Link></div>;
  return <div className="container section-space"><div className="panel p-4 p-md-5 mx-auto confirmation-panel text-center"><i className="bi bi-check-circle-fill text-success fs-1"/><h1 className="mt-3">Đặt hàng thành công</h1><p className="text-secondary">Cảm ơn bạn đã mua sắm tại Mini Store.</p><div className="order-detail text-start"><strong>Mã đơn: {order.id}</strong><p className="mt-2 mb-1">Ngày đặt: {order.date} · {order.status}</p>{order.items.map((item) => <div className="d-flex justify-content-between py-2" key={item.productId}>{item.name} × {item.quantity}<strong>{money(item.price * item.quantity)}</strong></div>)}<div className="border-top pt-3 mt-2 fw-bold d-flex justify-content-between">Tổng đơn hàng <span>{money(orderTotal(order))}</span></div><p className="mt-3 mb-0 small">Giao đến: {order.address?.recipient}, {order.address?.street}, {order.address?.city}</p></div><Link className="btn btn-primary" to="/user/orders">Xem đơn hàng</Link> <Link className="btn btn-light" to="/products">Tiếp tục mua sắm</Link></div></div>;
}
