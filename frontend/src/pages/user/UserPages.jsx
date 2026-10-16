import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { money, orderTotal } from "../../data/format";
import PageHeading from "../../components/common/PageHeading";

export function OrderDetail() {
  const { id } = useParams();
  const { account, orders } = useStore();
  const order = orders.find((item) => item.id === id && item.userId === account.id);
  if (!order) return <><PageHeading title="Không tìm thấy đơn hàng"/><Link to="/user/orders">Quay lại đơn hàng</Link></>;
  return <><PageHeading eyebrow="CHI TIẾT ĐƠN HÀNG" title={order.id}>{order.date} · {order.status}</PageHeading><section className="panel p-4"><h2 className="h5">Sản phẩm</h2>{order.items.map((item, i) => <div className="d-flex justify-content-between gap-3 border-bottom py-3" key={`${item.name}-${i}`}><span>{item.name} × {item.quantity}</span><span>{money(item.price)} <strong className="ms-3">{money(item.price * item.quantity)}</strong></span></div>)}<div className="text-end fw-bold pt-3">Tổng đơn hàng: {money(orderTotal(order))}</div><div className="order-detail"><strong>Địa chỉ nhận hàng</strong><p className="mb-0">{order.address ? `${order.address.recipient} · ${order.address.phone} · ${order.address.street}, ${order.address.city}` : "Chưa có thông tin địa chỉ trong đơn mẫu."}</p></div></section></>;
}

export function Addresses() {
  const { account, addresses, saveAddress, remove, setDefaultAddress } = useStore();
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const mine = addresses.filter((a) => a.userId === account.id);
  async function submit(e) { e.preventDefault(); const values = Object.fromEntries(new FormData(e.currentTarget)); const addr = { ...editing, ...values, userId: account.id, isDefault: values.isDefault === "on" }; const saved = await saveAddress(addr); if (saved) { setEditing(null); setNotice("Đã lưu địa chỉ."); } }
  async function del(addr) { if (window.confirm("Xóa địa chỉ này?")) { const deleted = await remove("addresses", addr.id); if (deleted) setNotice("Đã xóa địa chỉ."); } }
  return <><PageHeading eyebrow="TÀI KHOẢN CỦA BẠN" title="Địa chỉ nhận hàng" action={<button className="btn btn-primary" onClick={() => setEditing({})}>Thêm địa chỉ</button>}>Quản lý nơi nhận đơn hàng của bạn.</PageHeading>{notice && <div className="alert alert-success">{notice}</div>}{editing && <form className="panel p-4 mb-4" onSubmit={submit}><h2 className="h5">{editing.id ? "Sửa" : "Thêm"} địa chỉ</h2><div className="row g-3">{[["recipient","Người nhận"],["phone","Điện thoại"],["street","Địa chỉ"],["city","Tỉnh / thành phố"]].map(([name,label])=><div className="col-md-6" key={name}><label className="form-label">{label}</label><input className="form-control" name={name} defaultValue={editing[name] || ""} required/></div>)}</div><label className="form-check mt-3"><input className="form-check-input" type="checkbox" name="isDefault" defaultChecked={editing.isDefault}/> Đặt làm mặc định</label><button className="btn btn-primary mt-3">Lưu</button> <button type="button" className="btn btn-light mt-3" onClick={() => setEditing(null)}>Hủy</button></form>}<div className="row g-3">{mine.map((a)=><div className="col-md-6" key={a.id}><div className="panel p-4 h-100"><div className="d-flex justify-content-between"><strong>{a.recipient}</strong>{a.isDefault && <span className="status status-2">Mặc định</span>}</div><p className="small text-secondary mt-2">{a.phone}<br/>{a.street}, {a.city}</p><button className="btn btn-sm btn-light me-2" onClick={()=>setEditing(a)}>Sửa</button><button className="btn btn-sm btn-outline-danger" onClick={()=>del(a)}>Xóa</button>{!a.isDefault && <button className="btn btn-sm btn-link" onClick={()=>{setDefaultAddress(a.id);setNotice("Đã chọn địa chỉ mặc định.");}}>Đặt mặc định</button>}</div></div>)}</div>{!mine.length && <p className="empty-state">Bạn chưa lưu địa chỉ nào.</p>}</>;
}

export function Wishlist() {
  const { products, wishlist, toggleWishlist, addToCart } = useStore();
  const items = products.filter((p) => wishlist.includes(p.id));
  return <><PageHeading eyebrow="TÀI KHOẢN CỦA BẠN" title="Sản phẩm yêu thích">Danh sách sản phẩm bạn đã lưu.</PageHeading>{items.length ? <div className="row g-3">{items.map((p)=><div className="col-md-6" key={p.id}><div className="panel p-3 d-flex align-items-center gap-3"><img className="table-product" src={p.image} alt=""/><div className="flex-grow-1"><Link to={`/products/${p.id}`} className="fw-semibold">{p.name}</Link><div>{money(p.price)}</div></div><button className="btn btn-sm btn-primary" onClick={()=>addToCart(p.id)}>Thêm giỏ</button><button className="btn btn-sm btn-light text-danger" aria-label="Bỏ yêu thích" onClick={()=>toggleWishlist(p.id)}><i className="bi bi-heart-fill"/></button></div></div>)}</div> : <p className="empty-state">Chưa có sản phẩm yêu thích. <Link to="/products">Khám phá cửa hàng</Link></p>}</>;
}

export function ChangePassword() {
  const [message, setMessage] = useState("");
  const { changePassword } = useStore();
  async function submit(e) { e.preventDefault(); const f=new FormData(e.currentTarget); if(f.get("password")!==f.get("confirm")){setMessage("Mật khẩu xác nhận chưa khớp.");return;} const ok=await changePassword({currentPassword:f.get("current"),newPassword:f.get("password")}); setMessage(ok ? "Đã cập nhật mật khẩu." : "Không thể cập nhật mật khẩu."); if(ok)e.currentTarget.reset(); }
  return <><PageHeading eyebrow="TÀI KHOẢN CỦA BẠN" title="Đổi mật khẩu">Cập nhật mật khẩu đăng nhập cho tài khoản của bạn.</PageHeading><form className="panel p-4 profile-panel" onSubmit={submit}>{[["current","Mật khẩu hiện tại"],["password","Mật khẩu mới"],["confirm","Xác nhận mật khẩu mới"]].map(([name,label])=><div className="mb-3" key={name}><label className="form-label" htmlFor={name}>{label}</label><input className="form-control" id={name} name={name} type="password" minLength="8" required/></div>)}{message && <div className="alert alert-info">{message}</div>}<button className="btn btn-primary">Cập nhật mật khẩu</button></form></>;
}
