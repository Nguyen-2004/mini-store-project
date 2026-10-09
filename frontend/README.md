# Mini Store — Website quản lý cửa hàng mini

Frontend bài tập DevOps: React + Vite + JavaScript, React Router DOM, Axios, Bootstrap 5 và Bootstrap Icons. Không cần backend hoặc database.

## Chạy local

Dùng Node.js 24 LTS và npm (đồng nhất với Docker/CI).

```bash
npm install
npm run dev
```

Mở URL Vite in trong terminal (thường là http://localhost:5173).

Tùy chọn sao chép `.env.example` thành `.env` để cấu hình API. Chế độ mock không cần API hoạt động.

## Build production

```bash
npm run lint
npm run build
npm run preview
```

Kết quả ở `dist/`. Preview chỉ để kiểm tra local; production dùng Nginx.

## Docker

Cài Docker và bật Docker Engine / Docker Desktop (Linux containers).

```bash
docker build -t mini-store-frontend .
docker run --rm -p 8080:80 mini-store-frontend
```

Truy cập http://localhost:8080. Dừng bằng Ctrl+C.

Dockerfile gồm stage Node 24 Alpine (`npm ci`, `npm run build`) và stage Nginx phục vụ `dist`. Nginx fallback về `index.html` nên truy cập trực tiếp/refresh `/admin/dashboard`, `/user/dashboard`, `/products/1` không lỗi 404. Có endpoint `/health` và Docker healthcheck.

Khi có backend, truyền URL công khai tại thời điểm build:

```bash
docker build --build-arg VITE_API_URL=https://your-api.example/api -t mini-store-frontend .
```

URL trên là ví dụ cần thay bằng backend thực tế. Các biến `VITE_*` được nhúng vào JavaScript lúc build, không lưu secret vào chúng. `docker run -e` không thay đổi bundle đã build. Axios ở `src/services/api.js` dùng `import.meta.env.VITE_API_URL`; hiện chưa có lời gọi API.

## Tài khoản demo

| Vai trò | Username | Password | Sau đăng nhập    |
| ------- | -------- | -------- | ---------------- |
| User    | user     | 123      | /user/dashboard  |
| Admin   | admin    | 123      | /admin/dashboard |

Đăng nhập chỉ là mô phỏng phía client, không dùng cho xác thực production. localStorage lưu ID, username, role; không lưu mật khẩu. ProtectedRoute chuyển khách chưa đăng nhập về Login và chuyển người sai role về dashboard của họ. Logout xóa session.

## Chức năng

- Public: Home, danh mục tìm kiếm/lọc, chi tiết sản phẩm, About, Login, trang 404.
- Public: tìm kiếm/lọc/sắp xếp sản phẩm, chi tiết, cart/wishlist, checkout demo và xác nhận đơn. Guest cart nhập vào tài khoản sau login.
- User: dashboard, hồ sơ, đơn hàng/chi tiết, địa chỉ nhận hàng, wishlist và đổi mật khẩu mô phỏng.
- Admin: thống kê, biểu đồ doanh thu mẫu, đơn/người dùng gần đây; tìm kiếm và CRUD user/sản phẩm, bật/tắt trạng thái; lọc danh mục, tìm/lọc/cập nhật trạng thái đơn.
- Responsive navbar/sidebar, bảng cuộn ngang trên điện thoại, ảnh placeholder SVG nội bộ không phụ thuộc mạng.
- CRUD và profile lưu localStorage để giữ dữ liệu khi refresh. Thay đổi sản phẩm xuất hiện ngay ở Public.
- Hai tài khoản demo không được xóa hoặc đổi username/role để luôn có thể demo đăng nhập. Tài khoản thêm mới là dữ liệu quản lý, không có chức năng đăng nhập.
- Đơn hàng lưu tên/giá sản phẩm tại thời điểm đặt, nên sửa/xóa sản phẩm không làm thay đổi lịch sử. Xóa user giữ lại lịch sử đơn hàng.
- Checkout và xác thực chỉ mô phỏng phía frontend, không dùng cho giao dịch thật.

## Cấu trúc

```text
src/
  assets/                     # Tài nguyên của dự án
  components/
    common/                   # Brand, heading, card, bảng đơn dùng chung
    admin/                    # Form và bảng CRUD
  context/                    # State dữ liệu, session và localStorage
  layouts/                    # PublicLayout, UserLayout, AdminLayout
  pages/
    public/                   # Home, Products, ProductDetail, About, Login
    user/                     # UserDashboard, Profile, MyOrders
    admin/                    # Dashboard, Users, Products, Orders
  data/mockData.js             # Dữ liệu ban đầu, định dạng giá, tính tổng
  routes/ProtectedRoute.jsx   # Kiểm tra đăng nhập và role
  services/api.js             # Axios sẵn sàng cho backend
  App.jsx                     # Cấu hình routes
  main.jsx                    # Entry, Bootstrap + Icons
  index.css                   # Giao diện và responsive
public/products/              # Ảnh SVG placeholder
.github/workflows/deploy.yml  # CI và TODO CD
Dockerfile
nginx.conf
```

Để khôi phục dữ liệu, mở DevTools → Application → Local Storage và xóa hai key `mini-store-data-v1`, `mini-store-session-v1`, rồi tải lại trang.

## CI/CD GitHub Actions

Workflow chạy khi push hoặc pull request vào `main`, có thể chạy thủ công. Các bước: checkout → Node 24 → npm ci → lint → build → build Docker → kiểm tra cấu hình Nginx và SPA fallback.

Để sử dụng: commit cả `package-lock.json`, push lên GitHub branch main và bật Actions. Hiện workflow chỉ CI vì chưa có server/registry thật.

Trước khi deploy cần bổ sung:

1. Registry/image repository (Docker Hub hoặc GHCR).
2. Credentials registry trong GitHub Secrets; cấu hình GitHub Environment nếu cần.
3. Server Docker, domain, HTTPS, thông tin SSH và known hosts được xác minh.
4. Job CD `needs: ci`, chỉ chạy push main: push image theo commit SHA, pull/run tại server.
5. GitHub Variable `VITE_API_URL` nếu có backend (không bắt buộc với mock).
6. Kiểm tra health sau deploy, giữ image cũ để rollback.

Không có token, mật khẩu server hay credential giả trong workflow. Mật khẩu 123 chỉ dành cho hai tài khoản demo phía frontend.

## Checklist demo

- Mở Home, tìm/lọc sản phẩm, xem chi tiết; thử ID không tồn tại.
- Vào URL user/admin khi chưa đăng nhập: được chuyển về Login.
- Đăng nhập user / 123: xem dashboard, sửa profile, xem chi tiết đơn.
- User vào /admin/dashboard: trở về /user/dashboard.
- Đăng xuất, đăng nhập admin / 123: kiểm tra thống kê và CRUD.
- Admin vào /user/dashboard: trở về /admin/dashboard.
- Thêm/sửa/xóa user và sản phẩm; thử username trùng, giá âm, tìm kiếm không có kết quả.
- Lọc trạng thái đơn, xem chi tiết; refresh để kiểm tra lưu dữ liệu.
- Logout rồi mở URL được bảo vệ: trở về Login.
- Kiểm tra ở màn hình điện thoại: menu/sidebar và bảng cuộn ngang.
- Khi chạy Docker: refresh trực tiếp các route lồng nhau; kiểm tra /health.

## Kết quả kiểm tra thực tế

- npm install: thành công, audit không có lỗ hổng tại thời điểm kiểm tra.
- npm run lint và npm run build: thành công.
- Docker multi-stage: build thành công trên Linux Alpine. npm ci chỉ định musl để cài đủ native optional dependency của Vite.
- nginx -t: hợp lệ; container healthcheck: healthy.
- HTTP 200 và nội dung index.html khớp cho /products, /products/, /products/1, /user/dashboard, /admin/dashboard.
- Edge headless: đạt kiểm tra routing, đăng nhập sai/đúng, chặn role hai chiều, refresh session, logout, profile, CRUD user/product, đồng bộ Public, đơn hàng và filter.
- Kiểm tra giao diện desktop 1440px và mobile 390px; menu/sidebar hoạt động, trang không tràn ngang; bảng quản lý cuộn trong vùng bảng.
- Không ghi nhận lỗi JavaScript runtime trong lượt kiểm thử.
- Workflow đã được soát cấu hình; chưa chạy trên GitHub và chưa deploy server thật.
