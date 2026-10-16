import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.uuid(),
  quantity: z.coerce.number().int().min(1).max(1000),
});

export const quantitySchema = z.object({
  quantity: z.coerce.number().int().min(1).max(1000),
});

export const checkoutSchema = z.object({
  addressId: z.uuid().optional(),
  shippingAddress: z.object({
    recipient: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(8).max(24),
    street: z.string().trim().min(3).max(200),
    ward: z.string().trim().max(100).optional().default(""),
    district: z.string().trim().max(100).optional().default(""),
    city: z.string().trim().min(2).max(100),
  }).optional(),
}).refine((value) => value.addressId || value.shippingAddress, {
  message: "Cần chọn hoặc nhập địa chỉ giao hàng.",
});

export const addressSchema = z.object({
  name: z.string().trim().min(2).max(80).default("Nhà riêng"),
  recipient: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(24),
  street: z.string().trim().min(3).max(200),
  ward: z.string().trim().max(100).optional().default(""),
  district: z.string().trim().max(100).optional().default(""),
  city: z.string().trim().min(2).max(100),
  isDefault: z.boolean().default(false),
});

export const addressUpdateSchema = addressSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "Cần gửi ít nhất một trường cần cập nhật.",
});

export const orderStatusSchema = z.object({
  status: z.enum(["Đang xử lý", "Đang giao", "Hoàn thành", "Đã hủy"]),
});
