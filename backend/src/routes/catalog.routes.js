import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { createAdminProduct, createCategory, deleteAdminProduct, deleteCategory, getAdminCategories, getAdminProducts, getCategories, getProductById, getProducts, updateAdminProduct, updateCategory } from "../controllers/catalog.controller.js";
import { categorySchema, productQuerySchema, productSchema, productUpdateSchema } from "../validators/catalog.schemas.js";

export const productRouter = Router();
productRouter.get("/", validate(productQuerySchema, "query"), getProducts);
productRouter.get("/:id", getProductById);

export const categoryRouter = Router();
categoryRouter.get("/", getCategories);

export const adminCatalogRouter = Router();
adminCatalogRouter.use(authenticate, requireRole("ADMIN"));
adminCatalogRouter.get("/products", validate(productQuerySchema, "query"), getAdminProducts);
adminCatalogRouter.post("/products", validate(productSchema), createAdminProduct);
adminCatalogRouter.patch("/products/:id", validate(productUpdateSchema), updateAdminProduct);
adminCatalogRouter.delete("/products/:id", deleteAdminProduct);
adminCatalogRouter.get("/categories", getAdminCategories);
adminCatalogRouter.post("/categories", validate(categorySchema), createCategory);
adminCatalogRouter.patch("/categories/:id", validate(categorySchema.partial()), updateCategory);
adminCatalogRouter.delete("/categories/:id", deleteCategory);
