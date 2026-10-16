import { prisma } from "../config/database.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendData } from "../utils/response.js";
import { createProduct, deactivateProduct, getProduct, listProducts, updateProduct } from "../services/catalog.service.js";

export const getProducts = asyncHandler(async (req, res) => sendData(res, await listProducts(req.validated.query, false)));
export const getAdminProducts = asyncHandler(async (req, res) => sendData(res, await listProducts(req.validated.query, true)));
export const getProductById = asyncHandler(async (req, res) => sendData(res, await getProduct(req.params.id)));
export const createAdminProduct = asyncHandler(async (req, res) => sendData(res, await createProduct(req.body), 201));
export const updateAdminProduct = asyncHandler(async (req, res) => sendData(res, await updateProduct(req.params.id, req.body)));
export const deleteAdminProduct = asyncHandler(async (req, res) => sendData(res, await deactivateProduct(req.params.id)));

export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({ where: { products: { some: { isActive: true } } }, orderBy: { name: "asc" } });
  sendData(res, categories.map(({ id, name, slug }) => ({ id, name, slug })));
});

export const getAdminCategories = asyncHandler(async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
  sendData(res, categories.map(({ id, name, slug, _count }) => ({ id, name, slug, productCount: _count.products })));
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.create({ data: req.body, select: { id: true, name: true, slug: true } });
  sendData(res, category, 201);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.update({ where: { id: req.params.id }, data: req.body, select: { id: true, name: true, slug: true } });
  sendData(res, category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  sendData(res, { id: req.params.id, deleted: true });
});
