import { Link } from "react-router-dom";
export default function About() {
  return (
    <div className="container section-space">
      <div className="about-intro">
        <div className="eyebrow">CÂU CHUYỆN MINI STORE</div>
        <h1>
          Nhỏ thôi.
          <br />
          Nhưng luôn đủ đầy.
        </h1>
        <p>
          Mini Store là cửa hàng mini dành cho những nhu cầu quen thuộc: một hộp
          sữa cho bữa sáng, ít trái cây cho buổi chiều, hay bó rau xanh cho bữa
          cơm nhà.
        </p>
        <Link className="btn btn-primary" to="/products">
          Ghé xem sản phẩm{" "}
          <i aria-hidden="true" className="bi bi-arrow-right ms-2" />
        </Link>
      </div>
      <div className="row g-4 mt-4">
        {[
          [
            "heart",
            "Sự quan tâm",
            "Chúng mình chọn sự gần gũi và chu đáo trong từng điều nhỏ.",
          ],
          [
            "basket",
            "Sự tiện lợi",
            "Danh mục rõ ràng để bạn dễ dàng tìm thấy những món đồ cần thiết.",
          ],
          [
            "sun",
            "Sự giản dị",
            "Một trải nghiệm nhẹ nhàng, rõ ràng và thân thiện với mọi người.",
          ],
        ].map(([icon, title, body]) => (
          <div className="col-md-4" key={title}>
            <div className="panel p-4 h-100">
              <i
                aria-hidden="true"
                className={`bi bi-${icon} fs-2 text-success`}
              />
              <h2 className="h5 mt-4">{title}</h2>
              <p className="text-secondary">{body}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-secondary small mt-5">
        Website minh họa cho bài tập DevOps. Thông tin cửa hàng, sản phẩm và đơn
        hàng là dữ liệu giả lập.
      </p>
    </div>
  );
}
