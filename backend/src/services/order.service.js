import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { AppError, notFound } from "../utils/app-error.js";
import { pageInfo } from "../utils/response.js";
import { serializeOrder } from "../utils/serializers.js";

const includeOrder = { user: { select: { id: true, fullName: true } }, items: true };
const uiToStatus = {
  "Đang xử lý": "PROCESSING",
  "Đang giao": "SHIPPING",
  "Hoàn thành": "COMPLETED",
  "Đã hủy": "CANCELLED",
};
const allowedTransitions = {
  PROCESSING: new Set(["SHIPPING", "CANCELLED"]),
  SHIPPING: new Set(["COMPLETED"]),
  COMPLETED: new Set(),
  CANCELLED: new Set(),
};

async function withRetry(operation, attempts = 3) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (error.code !== "P2034" || attempt >= attempts) throw error;
    }
  }
}

export async function createOrder(userId, { addressId, shippingAddress }) {
  return withRetry(() => prisma.$transaction(async (tx) => {
    const cart = await tx.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    });
    if (!cart.length) throw new AppError(400, "Giỏ hàng đang trống.", "CART_EMPTY");

    let address = shippingAddress;
    if (addressId) {
      address = await tx.address.findFirst({ where: { id: addressId, userId } });
      if (!address) throw notFound("Không tìm thấy địa chỉ giao hàng của bạn.");
    }
    if (!address) throw new AppError(400, "Cần có địa chỉ giao hàng.", "ADDRESS_REQUIRED");

    let subtotal = new Prisma.Decimal(0);
    for (const line of cart) {
      const reservation = await tx.product.updateMany({
        where: { id: line.productId, isActive: true, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } },
      });
      if (reservation.count !== 1) {
        throw new AppError(409, "Một sản phẩm trong giỏ đã hết hàng hoặc không đủ tồn kho.", "INSUFFICIENT_STOCK", { productId: line.productId });
      }
      subtotal = subtotal.add(line.product.price.mul(line.quantity));
    }

    const order = await tx.order.create({
      data: {
        orderNumber: "MS-" + randomBytes(5).toString("hex").toUpperCase(),
        userId,
        status: "PROCESSING",
        subtotal,
        total: subtotal,
        recipient: address.recipient,
        phone: address.phone,
        street: address.street,
        ward: address.ward || null,
        district: address.district || null,
        city: address.city,
        items: {
          create: cart.map((line) => ({
            productId: line.productId,
            productName: line.product.name,
            productImage: line.product.image,
            unitPrice: line.product.price,
            quantity: line.quantity,
          })),
        },
      },
      include: includeOrder,
    });
    await tx.cartItem.deleteMany({ where: { userId } });
    return serializeOrder(order);
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 10000 }));
}

export async function listOrders({ userId, query, admin = false }) {
  const where = {};
  if (!admin) where.userId = userId;
  if (query.status && uiToStatus[query.status]) where.status = uiToStatus[query.status];
  if (query.q) {
    where.OR = [
      { orderNumber: { contains: query.q, mode: "insensitive" } },
      ...(admin ? [{ user: { is: { fullName: { contains: query.q, mode: "insensitive" } } } }] : []),
    ];
  }
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, include: includeOrder, orderBy: { createdAt: "desc" }, skip: (query.page - 1) * query.limit, take: query.limit }),
    prisma.order.count({ where }),
  ]);
  return { items: orders.map(serializeOrder), pagination: pageInfo(query.page, query.limit, total) };
}

export async function getOrder(id, userId, admin = false) {
  const order = await prisma.order.findFirst({
    where: { ...(isUuid(id) ? { id } : { orderNumber: id }), ...(admin ? {} : { userId }) },
    include: includeOrder,
  });
  if (!order) throw notFound("Không tìm thấy đơn hàng.");
  return serializeOrder(order);
}

export async function changeOrderStatus(id, uiStatus) {
  const nextStatus = uiToStatus[uiStatus];
  return withRetry(() => prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!current) throw notFound("Không tìm thấy đơn hàng.");
    if (current.status === nextStatus) return serializeOrder(await tx.order.findUnique({ where: { id }, include: includeOrder }));
    if (!allowedTransitions[current.status]?.has(nextStatus)) {
      throw new AppError(409, "Không thể chuyển đơn hàng từ trạng thái hiện tại sang trạng thái đã chọn.", "INVALID_STATUS_TRANSITION");
    }
    const updated = await tx.order.updateMany({
      where: { id, status: current.status },
      data: { status: nextStatus },
    });
    if (updated.count !== 1) throw new AppError(409, "Đơn hàng vừa được cập nhật. Hãy tải lại và thử lại.", "ORDER_CHANGED");
    if (nextStatus === "CANCELLED" && current.status === "PROCESSING") {
      for (const item of current.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
    }
    return serializeOrder(await tx.order.findUnique({ where: { id }, include: includeOrder }));
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }));
}

export async function cancelOwnOrder(orderNumber, userId) {
  const order = await prisma.order.findFirst({ where: { ...(isUuid(orderNumber) ? { id: orderNumber } : { orderNumber }), userId }, select: { id: true } });
  if (!order) throw notFound("Không tìm thấy đơn hàng.");
  return changeOrderStatus(order.id, "Đã hủy");
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
