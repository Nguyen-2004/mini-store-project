import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { money } from "../../data/format";
export default function ProductDetail() {
  const { id } = useParams();
  const { products, addToCart, toggleWishlist, wishlist, account } = useStore();
  const navigate = useNavigate();
  const withAccount = (action) => account ? action(product.id) : navigate("/login");
  const product = products.find((p) => p.id === id);
  if (!product)
    return (
      <div className="container section-space">
        <h1>Không tìm thấy sản phẩm</h1>
        <Link to="/products">Quay lại sản phẩm</Link>
      </div>
    );
  return (
    <div className="container section-space">
      <Link className="text-link" to="/products">
        <i aria-hidden="true" className="bi bi-arrow-left me-2" />
        Quay lại sản phẩm
      </Link>
      <div className="row g-5 align-items-center mt-2">
        <div className="col-md-6">
          <img
            className="detail-image"
            src={product.image}
            alt={product.name}
          />
        </div>
        <div className="col-md-6">
          <div className="eyebrow">{product.category}</div>
          <h1 className="mt-3">{product.name}</h1>
          <p className="text-secondary">{product.unit}</p>
          <div className="h2 price my-4">{money(product.price)}</div>
          <p className="description">{product.description}</p>
          <hr />
          <p>
            <i
              aria-hidden="true"
              className="bi bi-box-seam me-2 text-success"
            />
            {product.stock > 0
              ? `Còn hàng · ${product.stock} sản phẩm`
              : "Tạm hết hàng"}
          </p>
          <p className="small text-secondary">
            Sản phẩm được giao tận nơi trong khu vực phục vụ của Mini Store.
          </p>
          <div className="d-flex gap-2 mt-4">
            <button className="btn btn-primary" disabled={!product.stock} onClick={() => withAccount(addToCart)}><i className="bi bi-bag-plus me-2"/>Thêm vào giỏ</button>
            <button className={`btn ${wishlist.includes(product.id) ? "btn-outline-danger" : "btn-light"}`} onClick={() => withAccount(toggleWishlist)}><i className={`bi ${wishlist.includes(product.id) ? "bi-heart-fill" : "bi-heart"} me-2`}/>Yêu thích</button>
          </div>
        </div>
      </div>
    </div>
  );
}
