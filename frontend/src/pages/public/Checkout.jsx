import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { money } from "../../data/format";
import PageHeading from "../../components/common/PageHeading";

export default function Checkout() {
  const { account, addresses, cart, products, placeOrder, saveAddress } = useStore();
  const navigate = useNavigate();
  const mine = addresses.filter((address) => address.userId === account?.id);
  const [addressId, setAddressId] = useState(mine.find((address) => address.isDefault)?.id || mine[0]?.id || "new");
  const [error, setError] = useState("");
  const total = cart.reduce((sum, line) => sum + (products.find((p) => p.id === line.productId)?.price || 0) * line.quantity, 0);
  async function submit(event) {
    event.preventDefault();
    if (!cart.length) { setError("Giỏ hàng đang trống."); return; }
    let address = mine.find((item) => item.id === addressId);
    if (addressId === "new") {
      const form = new FormData(event.currentTarget);
      address = { name: "Giao hàng", userId: account.id, recipient: form.get("recipient").trim(), phone: form.get("phone").trim(), street: form.get("street").trim(), city: form.get("city").trim() };
      if (!address.recipient || !address.phone || !address.street || !address.city) { setError("Vui lòng nhập đầy đủ địa chỉ giao hàng."); return; }
      const addressId = await saveAddress(address);
      if (!addressId) { setError("Không lưu được địa chỉ. Vui lòng thử lại."); return; }
      address.id = addressId;
    }
    const order = await placeOrder(address);
    if (order) navigate(`/order-confirmation/${order.id}`, { state: { order } });
    else setError("Một sản phẩm vừa thay đổi tồn kho. Hãy kiểm tra lại giỏ hàng.");
  }
  return <div className="container section-space"><PageHeading eyebrow="THANH TOÁN" title="Thông tin giao hàng">Đơn hàng được lưu an toàn trong tài khoản của bạn.</PageHeading>
    {!account && <div className="alert alert-info">Vui lòng <Link to="/login">đăng nhập</Link> để hoàn tất đơn hàng.</div>}
    <form onSubmit={submit} className="row g-4"><div className="col-lg-7"><section className="panel p-4"><h2 className="h5 mb-3">Địa chỉ nhận hàng</h2>{mine.length > 0 && <select className="form-select mb-3" value={addressId} onChange={(e) => setAddressId(e.target.value)}><option value="new">Nhập địa chỉ mới</option>{mine.map((a) => <option key={a.id} value={a.id}>{a.recipient} · {a.street}, {a.city}</option>)}</select>}{addressId === "new" && <div className="row g-3">{[["recipient","Người nhận"],["phone","Số điện thoại"],["street","Địa chỉ"],["city","Tỉnh / thành phố"]].map(([name,label]) => <div className="col-md-6" key={name}><label className="form-label" htmlFor={name}>{label}</label><input className="form-control" id={name} name={name} defaultValue={name === "recipient" ? account?.fullName : name === "phone" ? account?.phone : ""} required/></div>)}</div>}{error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}</section></div><div className="col-lg-5"><section className="panel p-4"><h2 className="h5">Đơn hàng</h2>{cart.map((line) => { const p = products.find((item) => item.id === line.productId); return p && <div className="d-flex justify-content-between py-2 gap-3" key={p.id}><span>{p.name} × {line.quantity}</span><strong>{money(p.price * line.quantity)}</strong></div>; })}<div className="border-top pt-3 mt-2 d-flex justify-content-between"><strong>Tổng cộng</strong><strong>{money(total)}</strong></div><button className="btn btn-primary w-100 mt-4" disabled={!account || !cart.length}>Đặt hàng</button></section></div></form>
  </div>;
}
