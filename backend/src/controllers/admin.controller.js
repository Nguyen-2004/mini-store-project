import { prisma } from "../config/database.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendData } from "../utils/response.js";

export const getDashboard = asyncHandler(async (_req, res) => {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - index), 1));
    return {
      label: date.toLocaleDateString("vi-VN", { month: "short", timeZone: "UTC" }),
      start: date,
      end: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)),
    };
  });
  const [users, products, orders, completedOrders, recentOrders, sold] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.findMany({ where: { status: "COMPLETED" }, select: { total: true } }),
    prisma.order.findMany({ where: { createdAt: { gte: months[0].start } }, select: { createdAt: true, status: true, total: true } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: { order: { is: { status: "COMPLETED" } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);
  const productIds = sold.map((item) => item.productId);
  const bestProducts = productIds.length
    ? await prisma.product.findMany({ where: { id: { in: productIds } }, include: { category: true } })
    : [];
  const productMap = new Map(bestProducts.map((product) => [product.id, product]));
  const monthlyRevenue = months.map((month) => ({
    month: month.label,
    revenue: recentOrders.filter((order) => order.status === "COMPLETED" && order.createdAt >= month.start && order.createdAt < month.end).reduce((sum, order) => sum + Number(order.total), 0),
  }));
  const monthlyOrders = months.map((month) => ({
    month: month.label,
    count: recentOrders.filter((order) => order.createdAt >= month.start && order.createdAt < month.end).length,
  }));
  sendData(res, {
    totals: {
      users,
      products,
      orders,
      revenue: completedOrders.reduce((sum, order) => sum + Number(order.total), 0),
    },
    monthlyRevenue,
    monthlyOrders,
    bestsellers: sold.map((item) => {
      const product = productMap.get(item.productId);
      return product ? { id: product.id, name: product.name, category: product.category.name, unitsSold: item._sum.quantity || 0 } : null;
    }).filter(Boolean),
  });
});
