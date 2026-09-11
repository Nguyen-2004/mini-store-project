import { Link, useParams } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { money } from "../../data/mockData";
export default function ProductDetail() {
  const { id } = useParams();
  const { products } = useStore();
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
            Danh mục minh họa của Mini Store. Chưa hỗ trợ đặt hàng trực tuyến.
          </p>
        </div>
      </div>
    </div>
  );
}
