import { useState } from "react";
import { useStore } from "../../context/StoreContext";
import ProductCard from "../../components/common/ProductCard";
import PageHeading from "../../components/common/PageHeading";
export default function Products() {
  const { products } = useStore();
  const availableProducts = products.filter((product) => product.active !== false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [sort, setSort] = useState("featured");
  const filtered = availableProducts.filter(
    (p) =>
      `${p.name} ${p.description} ${p.category}`
        .toLocaleLowerCase("vi")
        .includes(search.toLocaleLowerCase("vi").trim()) &&
      (category === "Tất cả" || p.category === category),
  ).sort((a,b) => sort === "price-low" ? a.price-b.price : sort === "price-high" ? b.price-a.price : a.name.localeCompare(b.name, "vi"));
  return (
    <div className="container section-space">
      <PageHeading eyebrow="MỖI NGÀY MỘT CHÚT TƯƠI MỚI" title="Góc mua sắm">
        Những món đồ quen thuộc, được chọn lựa bằng sự quan tâm.
      </PageHeading>
      <div className="filter-bar">
        <div className="d-flex gap-2 flex-wrap">
          {["Tất cả", ...new Set(availableProducts.map((p) => p.category))].map((c) => (
            <button
              className={`btn ${category === c ? "btn-primary" : "btn-light"}`}
              onClick={() => setCategory(c)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          className="form-control search-input"
          aria-label="Tìm sản phẩm"
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-select sort-select" aria-label="Sắp xếp sản phẩm" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="featured">Tên sản phẩm</option><option value="price-low">Giá tăng dần</option><option value="price-high">Giá giảm dần</option>
        </select>
      </div>
      <p className="small text-secondary">{filtered.length} sản phẩm</p>
      <div className="row g-4">
        {filtered.map((product) => (
          <div className="col-sm-6 col-lg-4 col-xl-3" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      {!filtered.length && (
        <p className="empty-state">Không tìm thấy sản phẩm phù hợp.</p>
      )}
    </div>
  );
}
