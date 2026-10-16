export function serializeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone || "",
    role: user.role.toLowerCase(),
    active: user.isActive,
    createdAt: user.createdAt,
  };
}

export function serializeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    unit: product.unit,
    image: product.image,
    stock: product.stock,
    active: product.isActive,
    categoryId: product.categoryId,
    category: product.category?.name || "",
    createdAt: product.createdAt,
  };
}

const orderStatusToUi = {
  PENDING: "Đang xử lý",
  PROCESSING: "Đang xử lý",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export function serializeOrder(order) {
  return {
    id: order.orderNumber,
    orderId: order.id,
    userId: order.userId,
    customer: order.user?.fullName || "",
    date: order.createdAt.toISOString().slice(0, 10),
    status: orderStatusToUi[order.status],
    items: order.items.map((item) => ({
      productId: item.productId,
      name: item.productName,
      image: item.productImage,
      price: Number(item.unitPrice),
      quantity: item.quantity,
    })),
    address: {
      recipient: order.recipient,
      phone: order.phone,
      street: order.street,
      ward: order.ward || "",
      district: order.district || "",
      city: order.city,
    },
    total: Number(order.total),
  };
}

export function serializeAddress(address) {
  return {
    id: address.id,
    userId: address.userId,
    name: address.label,
    recipient: address.recipient,
    phone: address.phone,
    street: address.street,
    ward: address.ward || "",
    district: address.district || "",
    city: address.city,
    isDefault: address.isDefault,
  };
}
