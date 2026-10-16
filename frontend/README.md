# Mini Store frontend

Frontend React/Vite gọi API Express bằng Axios. Dữ liệu sản phẩm công khai tải từ backend; giỏ hàng, yêu thích, địa chỉ, đơn và trang hồ sơ yêu cầu đăng nhập.

## Chạy local

Khởi động PostgreSQL và backend theo hướng dẫn ở [README gốc](../README.md), rồi chạy:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Mặc định frontend gọi `/api`; Vite dev server proxy sang `http://localhost:3000`. `VITE_API_URL` có thể đổi URL API; biến này được nhúng vào bundle lúc build nên không đặt secret trong đó.

## Kiểm tra và build

```powershell
npm run lint
npm run build
npm run preview
```

Docker Compose tại repository root build frontend production bằng Nginx. Nginx phục vụ SPA fallback, health endpoint `/health` và proxy `/api/` tới service backend.
