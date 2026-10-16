import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { money } from "../../data/format";
import PageHeading from "../../components/common/PageHeading";

export default function Cart() {
  const { products, cart, setCartQuantity, removeFromCart, account } = useStore();
  const lines = cart.map((line) => ({ ...line, product: products.find((p) => p.id === line.productId) })).filter((line) => line.product);
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  return <div className="container section-space"><PageHeading eyebrow="GIỎ HÀNG" title="Giỏ hàng của bạn">Kiểm tra sản phẩm trước khi tiếp tục thanh toán.</PageHeading>
    {!lines.length ? <div className="empty-state"><i className="bi bi-basket2 fs-1 d-block mb-3" />{account ? "Giỏ hàng đang trống." : "Đăng nhập để xem giỏ hàng của bạn."}<div>{!account && <Link className="btn btn-primary mt-3 me-2" to="/login">Đăng nhập</Link>}<Link className="btn btn-light mt-3" to="/products">Tiếp tục mua sắm</Link></div></div> : <div className="row g-4"><div className="col-lg-8"><div className="panel">
      {lines.map(({ product, quantity }) => <div className="cart-line" key={product.id}><img src={product.image} alt=""/><div className="flex-grow-1"><Link className="fw-semibold" to={`/products/${product.id}`}>{product.name}</Link><div className="small text-secondary">{money(product.price)} / {product.unit}</div></div><div className="input-group input-group-sm quantity-control"><button className="btn btn-light" aria-label="Giảm số lượng" onClick={() => setCartQuantity(product.id, quantity - 1)}>−</button><input className="form-control text-center" aria-label="Số lượng" value={quantity} readOnly/><button className="btn btn-light" aria-label="Tăng số lượng" disabled={quantity >= product.stock} onClick={() => setCartQuantity(product.id, quantity + 1)}>+</button></div><strong>{money(product.price * quantity)}</strong><button className="btn btn-sm btn-light text-danger" aria-label="Xóa sản phẩm" onClick={() => removeFromCart(product.id)}><i className="bi bi-trash"/></button></div>)}
    </div></div><div className="col-lg-4"><div className="panel p-4"><h2 className="h5">Tóm tắt đơn hàng</h2><div className="d-flex justify-content-between py-3"><span>Tạm tính</span><strong>{money(subtotal)}</strong></div><div className="d-flex justify-content-between border-top pt-3"><strong>Tổng cộng</strong><strong>{money(subtotal)}</strong></div><Link className="btn btn-primary w-100 mt-4" to="/checkout">Tiến hành thanh toán</Link></div></div></div>}
  </div>;
}
