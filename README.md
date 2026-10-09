# Mini Store

Project Mini Store phục vụ bài thực hành DevOps. Frontend dùng React, Vite, React Router, Bootstrap 5 và dữ liệu demo lưu trong localStorage. Backend sẽ được phát triển trong backend/ ở đợt tiếp theo; hiện chưa có API hoặc database.

## Chạy frontend

    cd frontend
    npm ci
    npm run dev

Build và kiểm tra code:

    cd frontend
    npm run lint
    npm run build

Tạo frontend/.env từ frontend/.env.example khi cần cấu hình URL API. Chế độ hiện tại dùng mock data và không yêu cầu backend.

## Docker

Dockerfile và Nginx config nằm trong frontend/. Build từ root monorepo:

    docker build -t mini-store-frontend ./frontend
    docker run --rm -p 8080:80 mini-store-frontend

Nginx phục vụ SPA và chuyển các route React Router về index.html. GitHub Actions chạy lint, build, build image và kiểm tra health/SPA routes. Workflow chỉ làm CI, chưa cấu hình triển khai lên server.

## Cấu trúc

    frontend/  React application, Dockerfile, Nginx, mock data
    backend/   Dành cho backend ở đợt tiếp theo (hiện chưa triển khai)
    .github/   GitHub Actions CI

Tài khoản demo: user / 123 và admin / 123. Authentication chỉ mô phỏng ở frontend.
