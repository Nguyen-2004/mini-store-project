import { prisma } from "../config/database.js";
import { AppError, notFound } from "../utils/app-error.js";

export async function getCart(userId) {
  const lines = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "asc" },
  });
  const items = lines.map(({ productId, quantity, product }) => ({
    productId,
    quantity,
    product: {
      id: product.id,
      name: product.name,
      image: product.image,
      category: product.category.name,
      unit: product.unit,
      price: Number(product.price),
      stock: product.stock,
      active: product.isActive,
    },
    lineTotal: Number(product.price) * quantity,
  }));
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return { items, subtotal, total: subtotal };
}

export async function addCartItem(userId, productId, quantity) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) throw notFound("Không tìm thấy sản phẩm đang bán.");
  if (quantity > product.stock) throw new AppError(409, "Số lượng vượt quá tồn kho.", "INSUFFICIENT_STOCK");
  const current = await prisma.cartItem.findUnique({ where: { userId_productId: { userId, productId } } });
  if (current && current.quantity + quantity > product.stock) {
    throw new AppError(409, "Số lượng trong giỏ vượt quá tồn kho.", "INSUFFICIENT_STOCK");
  }
  await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId, quantity },
    update: { quantity: { increment: quantity } },
  });
  return getCart(userId);
}

export async function setCartItemQuantity(userId, productId, quantity) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) throw notFound("Không tìm thấy sản phẩm đang bán.");
  if (quantity > product.stock) throw new AppError(409, "Số lượng vượt quá tồn kho.", "INSUFFICIENT_STOCK");
  const result = await prisma.cartItem.updateMany({
    where: { userId, productId },
    data: { quantity },
  });
  if (!result.count) throw notFound("Sản phẩm không có trong giỏ hàng.");
  return getCart(userId);
}

export async function removeCartItem(userId, productId) {
  await prisma.cartItem.deleteMany({ where: { userId, productId } });
  return getCart(userId);
}

export async function clearCart(userId) {
  await prisma.cartItem.deleteMany({ where: { userId } });
  return { items: [], subtotal: 0, total: 0 };
}
