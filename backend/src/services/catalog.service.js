import { prisma } from "../config/database.js";
import { AppError, notFound } from "../utils/app-error.js";
import { pageInfo } from "../utils/response.js";
import { serializeProduct } from "../utils/serializers.js";

function productWhere(query, includeInactive) {
  const where = {};
  if (!includeInactive) where.isActive = true;
  else if (query.status === "active") where.isActive = true;
  else if (query.status === "inactive") where.isActive = false;
  if (query.q) where.OR = [
    { name: { contains: query.q, mode: "insensitive" } },
    { description: { contains: query.q, mode: "insensitive" } },
  ];
  if (query.category) {
    where.category = { is: { OR: [{ id: query.category }, { slug: query.category }, { name: { equals: query.category, mode: "insensitive" } }] } };
  }
  return where;
}

export async function listProducts(query, includeInactive = false) {
  const where = productWhere(query, includeInactive);
  const orderBy = {
    name: { name: "asc" },
    "price-asc": { price: "asc" },
    "price-desc": { price: "desc" },
    newest: { createdAt: "desc" },
  }[query.sort] || { name: "asc" };
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.product.count({ where }),
  ]);
  return { items: products.map(serializeProduct), pagination: pageInfo(query.page, query.limit, total) };
}

export async function getProduct(id, includeInactive = false) {
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!product || (!includeInactive && !product.isActive)) throw notFound("Không tìm thấy sản phẩm.");
  return serializeProduct(product);
}

export async function resolveCategory(categoryId, categoryName) {
  const category = categoryId
    ? await prisma.category.findUnique({ where: { id: categoryId } })
    : await prisma.category.findFirst({ where: { OR: [{ name: categoryName }, { slug: categoryName }] } });
  if (!category) throw new AppError(400, "Danh mục không tồn tại.", "CATEGORY_NOT_FOUND");
  return category.id;
}

export async function createProduct(input) {
  const categoryId = await resolveCategory(input.categoryId, input.category);
  const product = await prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      stock: input.stock,
      unit: input.unit,
      image: input.image,
      isActive: input.active,
      categoryId,
    },
    include: { category: true },
  });
  return serializeProduct(product);
}

export async function updateProduct(id, input) {
  const current = await prisma.product.findUnique({ where: { id } });
  if (!current) throw notFound("Không tìm thấy sản phẩm.");
  const { category, categoryId: requestedCategoryId, active, ...fields } = input;
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...fields,
      ...(active !== undefined ? { isActive: active } : {}),
      ...(category || requestedCategoryId ? { categoryId: await resolveCategory(requestedCategoryId, category) } : {}),
    },
    include: { category: true },
  });
  return serializeProduct(product);
}

export async function deactivateProduct(id) {
  const product = await prisma.product.update({ where: { id }, data: { isActive: false }, include: { category: true } });
  return serializeProduct(product);
}
