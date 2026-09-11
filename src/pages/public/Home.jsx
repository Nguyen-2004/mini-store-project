import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import ProductCard from "../../components/common/ProductCard";
export default function Home() {
  const { products } = useStore();
  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center gy-5">
            <div className="col-lg-6">
              <span className="pill">
                <i aria-hidden="true" className="bi bi-flower1 me-2" />
                TƯƠI MỚI MỖI NGÀY
              </span>
              <h1>
                Cửa hàng nhỏ.
                <br />
                Niềm vui <em>mỗi ngày.</em>
              </h1>
              <p>
                Thực phẩm tươi ngon và những món đồ thiết yếu.
                <br className="d-none d-md-block" /> Tất cả bạn cần, ngay tại
                Mini Store.
              </p>
              <Link className="btn btn-primary btn-lg" to="/products">
                Khám phá sản phẩm{" "}
                <i aria-hidden="true" className="bi bi-arrow-right ms-3" />
              </Link>
              <div className="hero-caption">
                <span className="tiny-check">
                  <i aria-hidden="true" className="bi bi-check2" />
                </span>{" "}
                Chọn lọc kỹ càng <span className="mx-3">·</span> Giá cả thân
                thiện
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-art">
                <div className="hero-orbit" />
                <img
                  src="/products/hero.svg"
                  alt="Giỏ thực phẩm gồm sữa, bánh mì, cam và rau xanh"
                />
                <span className="floating-label">
                  <i aria-hidden="true" className="bi bi-heart-fill" /> Một giỏ
                  đầy yêu thương
                </span>
                <span className="hero-stamp">
                  FRESH
                  <br />
                  <strong>DAILY</strong>
                  <br />
                  MINI STORE
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="container">
        <div className="benefits row g-0">
          {[
            ["patch-check", "Chất lượng chọn lọc", "Chăm chút từng sản phẩm"],
            ["basket2", "Đủ đầy thiết yếu", "Dễ chọn cho mỗi ngày"],
            ["emoji-smile", "Mua sắm thân thiện", "Đơn giản và gần gũi"],
          ].map(([icon, title, text]) => (
            <div className="col-md-4 benefit" key={title}>
              <i aria-hidden="true" className={`bi bi-${icon}`} />
              <div>
                <strong>{title}</strong>
                <small>{text}</small>
              </div>
            </div>
          ))}
        </div>
        <section className="section-space">
          <div className="section-heading">
            <div>
              <div className="eyebrow">GÓC NHỎ ĐƯỢC YÊU THÍCH</div>
              <h2>Sản phẩm nổi bật</h2>
            </div>
            <Link to="/products" className="text-link">
              Xem tất cả{" "}
              <i aria-hidden="true" className="bi bi-arrow-right ms-2" />
            </Link>
          </div>
          <div className="row g-4">
            {products.slice(0, 4).map((product) => (
              <div className="col-sm-6 col-lg-3" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
        <section className="about-banner">
          <div>
            <div className="eyebrow">CHÀO BẠN, CHÚNG MÌNH LÀ MINI STORE</div>
            <h2>
              Gần gũi như cửa hàng
              <br />
              ngay đầu ngõ.
            </h2>
            <p>
              Một nơi nhỏ để tìm những điều cần thiết cho cuộc sống.
              <br />
              Chúng mình tin niềm vui bắt đầu từ những điều giản dị.
            </p>
            <Link className="btn btn-outline-primary" to="/about">
              Câu chuyện của chúng mình{" "}
              <i aria-hidden="true" className="bi bi-arrow-right ms-2" />
            </Link>
          </div>
          <i aria-hidden="true" className="bi bi-shop-window about-icon" />
        </section>
      </div>
    </>
  );
}
