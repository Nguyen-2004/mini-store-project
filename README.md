# Mini Store

Mini Store là ứng dụng cửa hàng mẫu dùng React/Vite, Express và PostgreSQL. Frontend gọi API thật; tài khoản, danh mục, sản phẩm, giỏ hàng, địa chỉ, yêu thích và đơn hàng được lưu trong database.

## Chạy bằng Docker Compose

Cài Docker Desktop/Engine, sau đó tạo file cấu hình local từ mẫu:

```powershell
Copy-Item compose.env.example .env
```

Thay các giá trị `POSTGRES_PASSWORD`, `JWT_SECRET` và `ADMIN_PASSWORD` trong `.env` trước khi dùng. Đặt `JWT_SECRET` ngẫu nhiên, tối thiểu 32 ký tự; mật khẩu quản trị tối thiểu 12 ký tự. Không commit `.env`.

Khởi động các dịch vụ:

```powershell
docker compose up --build -d
docker compose ps
```

Mở <http://localhost:8080>. Backend sẽ đợi PostgreSQL khỏe, chạy migration, seed dữ liệu ban đầu rồi mới nhận request. PostgreSQL bind vào localhost; frontend Nginx proxy `/api` sang backend. Dừng ứng dụng bằng `docker compose down`; dữ liệu vẫn được giữ trong volume `postgres_data`. Chỉ xóa volume khi muốn xóa toàn bộ database.

## Chạy từng dịch vụ khi phát triển

Cần Node.js 24 và một PostgreSQL đang chạy. Tạo `backend/.env` từ `backend/.env.example`, rồi đặt database URL, JWT secret và thông tin quản trị riêng.

```powershell
cd backend
npm ci
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

Trong terminal khác, chạy frontend:

```powershell
cd frontend
npm ci
npm run dev
```

`backend/.env.example` dùng PostgreSQL tại `localhost:55432`, trùng với cổng loopback trong Compose. Frontend dev dùng URL `/api` cùng origin và Vite proxy tới backend ở `localhost:3000`; chỉ cần tạo `frontend/.env` nếu muốn ghi đè URL API. Backend cho phép CORS từ `CORS_ORIGIN` (có thể là danh sách origin phân tách bằng dấu phẩy).

## API

Tất cả response thành công có dạng `{ "data": ... }`; lỗi trả về thông báo và mã request. Endpoint health của backend là `GET /health`.

| Nhóm | Endpoint chính | Quyền |
| --- | --- | --- |
| Xác thực | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/change-password` | Đăng ký/đăng nhập công khai; các endpoint còn lại cần bearer token |
| Danh mục và sản phẩm | `GET /api/categories`, `GET /api/products`, `GET /api/products/:id` | Công khai |
| Giỏ hàng | `GET/DELETE /api/cart`, `POST /api/cart/items`, `PATCH/DELETE /api/cart/items/:productId` | Người dùng đã đăng nhập |
| Đơn hàng | `GET/POST /api/orders`, `GET /api/orders/:id`, `POST /api/orders/:id/cancel` | Chủ tài khoản |
| Hồ sơ | `/api/users/me`, `/api/users/addresses`, `/api/users/wishlist` | Người dùng đã đăng nhập |
| Quản trị | `/api/admin/users`, `/api/admin/products`, `/api/admin/categories`, `/api/admin/orders`, `/api/admin/dashboard` | Chỉ admin |

Giá và tồn kho được đọc từ database khi checkout. Việc tạo đơn, trừ kho, lưu snapshot sản phẩm/địa chỉ và xóa giỏ chạy trong transaction; client không thể gửi giá để ghi đè tổng tiền. Hủy đơn đang xử lý hoàn kho trong cùng transaction. API kiểm tra quyền sở hữu đơn/địa chỉ/giỏ và không trả password hash.

## Database và seed

Schema và migration PostgreSQL nằm trong `backend/prisma/`. Migration production dùng `npm run db:deploy`; `npm run db:migrate` dành cho phát triển schema. Seed tạo danh mục, sáu sản phẩm mẫu và admin theo biến `ADMIN_*`. Seed có thể chạy lại: không ghi đè tồn kho hoặc mật khẩu quản trị hiện có. Admin khởi tạo cần `ADMIN_EMAIL`, `ADMIN_USERNAME` và `ADMIN_PASSWORD`.

## Kiểm tra

```powershell
cd backend
npm run lint
npx prisma validate
npm test

cd ../frontend
npm run lint
npm run build
```

Test backend cần PostgreSQL đã migrate và seed. GitHub Actions dùng PostgreSQL service để kiểm tra schema, API/auth/role, giỏ hàng, checkout, kho và quyền sở hữu đơn; sau đó lint/build frontend và build hai Docker image.

## Cấu trúc

```text
frontend/                 React application, Dockerfile và Nginx
backend/                  Express API, Prisma schema/migrations, seed và integration tests
docker-compose.yml        PostgreSQL + backend + frontend
compose.env.example       Mẫu biến môi trường local; không chứa secret production
.github/workflows/        CI
```

CI kiểm tra và build image, chưa tự deploy lên máy chủ. Cấu hình registry, server và quy trình deploy cần được cung cấp trước khi thêm CD.
