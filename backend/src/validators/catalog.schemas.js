import { z } from "zod";

const optionalText = (max) => z.string().trim().max(max);
const productFields = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(1).max(5000),
  price: z.coerce.number().finite().positive().max(9999999999.99),
  stock: z.coerce.number().int().min(0).max(10000000),
  unit: z.string().trim().min(1).max(80).default("Sản phẩm"),
  image: z.string().trim().min(1).max(500),
  category: z.string().trim().min(1).max(100).optional(),
  categoryId: z.uuid().optional(),
  active: z.boolean().default(true),
});

export const productSchema = productFields.refine((value) => value.category || value.categoryId, {
  message: "Cần chọn danh mục.",
  path: ["category"],
});

export const productUpdateSchema = productFields.partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Cần gửi ít nhất một trường cần cập nhật.",
  })
  .refine((value) => !(value.category !== undefined || value.categoryId !== undefined) || value.category || value.categoryId, {
    message: "Cần chọn danh mục.",
    path: ["category"],
  });

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/),
});

export const productQuerySchema = z.object({
  q: optionalText(120).optional(),
  category: optionalText(100).optional(),
  status: z.enum(["active", "inactive", "all"]).optional(),
  sort: z.enum(["name", "price-asc", "price-desc", "newest"]).default("name"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});
