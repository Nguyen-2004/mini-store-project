import axios from "axios";

export const TOKEN_KEY = "mini-store-token-v1";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api", timeout: 15000 });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((response) => response, (error) => {
  error.userMessage = error.response?.data?.message || (error.code === "ECONNABORTED" ? "Máy chủ phản hồi quá lâu." : "Không thể kết nối máy chủ.");
  return Promise.reject(error);
});
export const unwrap = (response) => response.data.data;
export const itemsOf = (value) => Array.isArray(value) ? value : value?.items || [];
export default api;
