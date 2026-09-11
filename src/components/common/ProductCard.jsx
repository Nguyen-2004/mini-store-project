import { Link } from "react-router-dom";
import { money } from "../../data/mockData";
export default function ProductCard({ product }) {
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
      </div>
    </article>
  );
}
