export const money = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );
export const statuses = ["Đang xử lý", "Đang giao", "Hoàn thành", "Đã hủy"];
export const initialUsers = [
  {
    id: "u1",
    username: "user",
    fullName: "Nguyễn Minh Anh",
    email: "user@example.com",
    phone: "0901234567",
    role: "user",
  },
  {
    id: "u2",
    username: "admin",
    fullName: "Quản trị Mini Store",
    email: "admin@example.com",
    phone: "0909876543",
    role: "admin",
  },
  {
    id: "u3",
    username: "linh",
    fullName: "Trần Khánh Linh",
    email: "linh@example.com",
    phone: "0912345678",
    role: "user",
  },
  {
    id: "u4",
    username: "nam",
    fullName: "Lê Hoàng Nam",
    email: "nam@example.com",
    phone: "0987654321",
    role: "user",
  },
];
export const initialProducts = [
  {
    id: "1",
    name: "Sữa tươi nguyên chất",
    category: "Sữa & đồ uống",
    price: 35000,
    unit: "Hộp 1 lít",
    stock: 42,
    image: "/products/milk.svg",
    description:
      "Sữa tươi thơm nhẹ, vị béo tự nhiên. Một lựa chọn đơn giản cho bữa sáng của cả gia đình.",
  },
  {
    id: "2",
    name: "Bánh mì thủ công",
    category: "Bánh & ngũ cốc",
    price: 28000,
    unit: "Ổ 300g",
    stock: 24,
    image: "/products/bread.svg",
    description:
      "Bánh mì vỏ giòn với ruột mềm, thích hợp dùng cùng bơ, mứt hoặc làm sandwich.",
  },
  {
    id: "3",
    name: "Cam vàng mọng nước",
    category: "Trái cây",
    price: 65000,
    unit: "Túi 1kg",
    stock: 36,
    image: "/products/orange.svg",
    description:
      "Cam vàng tươi, vị ngọt thanh xen chút chua nhẹ. Dùng trực tiếp hoặc ép nước cho bữa sáng.",
  },
  {
    id: "4",
    name: "Trứng gà tươi",
    category: "Thực phẩm",
    price: 42000,
    unit: "Hộp 10 quả",
    stock: 30,
    image: "/products/eggs.svg",
    description:
      "Trứng gà tiện lợi cho những món ăn hằng ngày. Bảo quản nơi mát và nấu chín trước khi dùng.",
  },
  {
    id: "5",
    name: "Cà phê rang mộc",
    category: "Sữa & đồ uống",
    price: 89000,
    unit: "Gói 250g",
    stock: 18,
    image: "/products/coffee.svg",
    description:
      "Cà phê rang mộc hương thơm đậm, dành cho một buổi sáng chậm rãi. Phù hợp pha phin.",
  },
  {
    id: "6",
    name: "Rau xanh theo mùa",
    category: "Thực phẩm",
    price: 22000,
    unit: "Bó 500g",
    stock: 28,
    image: "/products/greens.svg",
    description:
      "Rau xanh cho bữa cơm gia đình. Rửa sạch trước khi chế biến, bảo quản trong ngăn mát.",
  },
];
export const initialOrders = [
  {
    id: "MS-1006",
    userId: "u1",
    customer: "Nguyễn Minh Anh",
    date: "2026-09-11",
    status: "Đang xử lý",
    items: [
      { name: "Sữa tươi nguyên chất", price: 35000, quantity: 2 },
      { name: "Bánh mì thủ công", price: 28000, quantity: 1 },
    ],
  },
  {
    id: "MS-1005",
    userId: "u3",
    customer: "Trần Khánh Linh",
    date: "2026-09-10",
    status: "Đang giao",
    items: [{ name: "Cà phê rang mộc", price: 89000, quantity: 2 }],
  },
  {
    id: "MS-1004",
    userId: "u1",
    customer: "Nguyễn Minh Anh",
    date: "2026-09-09",
    status: "Hoàn thành",
    items: [{ name: "Cam vàng mọng nước", price: 65000, quantity: 2 }],
  },
  {
    id: "MS-1003",
    userId: "u4",
    customer: "Lê Hoàng Nam",
    date: "2026-09-08",
    status: "Hoàn thành",
    items: [{ name: "Trứng gà tươi", price: 42000, quantity: 3 }],
  },
  {
    id: "MS-1002",
    userId: "u1",
    customer: "Nguyễn Minh Anh",
    date: "2026-09-07",
    status: "Đang giao",
    items: [{ name: "Rau xanh theo mùa", price: 22000, quantity: 2 }],
  },
  {
    id: "MS-1001",
    userId: "u1",
    customer: "Nguyễn Minh Anh",
    date: "2026-09-05",
    status: "Đã hủy",
    items: [{ name: "Cà phê rang mộc", price: 89000, quantity: 1 }],
  },
];
export const orderTotal = (order) =>
  order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
