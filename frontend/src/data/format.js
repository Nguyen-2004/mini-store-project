export const money = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export const statuses = ["Đang xử lý", "Đang giao", "Hoàn thành", "Đã hủy"];

export const orderTotal = (order) =>
  order.total ?? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
