import { Link, useNavigate } from "react-router-dom";
import { money } from "../../data/format";
import { useStore } from "../../context/StoreContext";
export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist, account } = useStore();
  const navigate = useNavigate();
  const requireAccount = () => { if (!account) navigate("/login"); };
  return (
    <article className="product-card h-100">
      <Link to={`/products/${product.id}`} className="product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
      </Link>
      <div className="p-4">
        <span className="eyebrow">{product.category}</span>
        <h3 className="h6 mt-2">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="small text-secondary">{product.unit}</p>
        <div className="d-flex justify-content-between align-items-center gap-2">
          <strong className="price">{money(product.price)}</strong>
          <Link
            className="detail-link"
            to={`/products/${product.id}`}
            aria-label={`Xem chi tiết ${product.name}`}
          >
            Chi tiết <i aria-hidden="true" className="bi bi-arrow-up-right" />
          </Link>
        </div>
        <div className="d-flex gap-2 mt-3">
          <button className="btn btn-primary btn-sm flex-grow-1" disabled={!product.stock} onClick={() => account ? addToCart(product.id) : requireAccount()}>
            <i aria-hidden="true" className="bi bi-bag-plus me-1" /> Thêm giỏ
          </button>
          <button className={`btn btn-sm ${wishlist.includes(product.id) ? "btn-outline-danger" : "btn-light"}`} aria-label="Yêu thích" onClick={() => account ? toggleWishlist(product.id) : requireAccount()}>
            <i aria-hidden="true" className={`bi ${wishlist.includes(product.id) ? "bi-heart-fill" : "bi-heart"}`} />
          </button>
        </div>
      </div>
    </article>
  );
}
