import axios from "axios";
// Chưa gọi API trong chế độ mock. Cấu hình URL khi kết nối backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});
export default api;
