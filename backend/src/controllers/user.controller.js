import bcrypt from "bcrypt";
import { prisma } from "../config/database.js";
import { AppError, notFound } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { pageInfo, sendData } from "../utils/response.js";
import { serializeAddress, serializeUser } from "../utils/serializers.js";

export const getProfile = asyncHandler(async (req, res) => sendData(res, serializeUser(req.user)));

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({ where: { id: req.user.id }, data: req.body });
  sendData(res, serializeUser(user));
});

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({ where: { userId: req.user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
  sendData(res, addresses.map(serializeAddress));
});

export const createAddress = asyncHandler(async (req, res) => {
  const { name, ...fields } = req.body;
  const address = await prisma.$transaction(async (tx) => {
    if (fields.isDefault) await tx.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    const hasAddress = await tx.address.count({ where: { userId: req.user.id } });
    return tx.address.create({ data: { ...fields, label: name, userId: req.user.id, isDefault: fields.isDefault || hasAddress === 0 } });
  });
  sendData(res, serializeAddress(address), 201);
});

export const updateAddress = asyncHandler(async (req, res) => {
  const { name, ...fields } = req.body;
  const address = await prisma.$transaction(async (tx) => {
    const current = await tx.address.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!current) throw notFound("Không tìm thấy địa chỉ.");
    if (fields.isDefault === true) await tx.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    return tx.address.update({ where: { id: current.id }, data: { ...fields, ...(name !== undefined ? { label: name } : {}) } });
  });
  sendData(res, serializeAddress(address));
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const deleted = await prisma.address.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
  if (!deleted.count) throw notFound("Không tìm thấy địa chỉ.");
  const remaining = await prisma.address.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: "asc" }, take: 1 });
  if (remaining[0] && !(await prisma.address.findFirst({ where: { userId: req.user.id, isDefault: true } }))) {
    await prisma.address.update({ where: { id: remaining[0].id }, data: { isDefault: true } });
  }
  sendData(res, { id: req.params.id, deleted: true });
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const updated = await prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!address) throw notFound("Không tìm thấy địa chỉ.");
    await tx.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    return tx.address.update({ where: { id: address.id }, data: { isDefault: true } });
  });
  sendData(res, serializeAddress(updated));
});

export const getWishlist = asyncHandler(async (req, res) => {
  const saved = await prisma.wishlistItem.findMany({
    where: { userId: req.user.id },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });
  sendData(res, saved.map(({ product }) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    unit: product.unit,
    image: product.image,
    stock: product.stock,
    active: product.isActive,
    categoryId: product.categoryId,
    category: product.category.name,
  })));
});

export const addWishlistItem = asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({ where: { id: req.body.productId, isActive: true } });
  if (!product) throw notFound("Không tìm thấy sản phẩm đang bán.");
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: req.user.id, productId: product.id } },
    create: { userId: req.user.id, productId: product.id },
    update: {},
  });
  sendData(res, { productId: product.id }, 201);
});

export const removeWishlistItem = asyncHandler(async (req, res) => {
  await prisma.wishlistItem.deleteMany({ where: { userId: req.user.id, productId: req.params.productId } });
  sendData(res, { productId: req.params.productId, deleted: true });
});

export const getAdminUsers = asyncHandler(async (req, res) => {
  const query = req.validated.query;
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const where = {};
  if (query.q) where.OR = [
    { username: { contains: query.q, mode: "insensitive" } },
    { fullName: { contains: query.q, mode: "insensitive" } },
    { email: { contains: query.q, mode: "insensitive" } },
  ];
  if (query.status === "active") where.isActive = true;
  if (query.status === "inactive") where.isActive = false;
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.user.count({ where }),
  ]);
  sendData(res, { items: users.map(serializeUser), pagination: pageInfo(page, limit, total) });
});

export const createAdminUser = asyncHandler(async (req, res) => {
  const { password, role, ...values } = req.body;
  const user = await prisma.user.create({
    data: { ...values, username: values.username.toLowerCase(), role, passwordHash: await bcrypt.hash(password, 12) },
  });
  sendData(res, serializeUser(user), 201);
});

export const updateAdminUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id && ((req.body.role && req.body.role !== "ADMIN") || req.body.active === false)) {
    throw new AppError(400, "Không thể vô hiệu hóa hoặc hạ quyền tài khoản quản trị đang sử dụng.", "SELF_ADMIN_PROTECTION");
  }
  const { active, ...values } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { ...values, ...(active !== undefined ? { isActive: active } : {}) },
  });
  sendData(res, serializeUser(user));
});

export const deleteAdminUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) throw new AppError(400, "Không thể vô hiệu hóa tài khoản đang sử dụng.", "SELF_ADMIN_PROTECTION");
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
  sendData(res, serializeUser(user));
});
