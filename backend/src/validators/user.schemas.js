import { z } from "zod";

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.email().trim().max(254).transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(24).optional().default(""),
});

export const adminUserCreateSchema = z.object({
  username: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9._-]+$/),
  email: z.email().trim().max(254).transform((value) => value.toLowerCase()),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(24).optional().default(""),
  password: z.string().min(8).max(72),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});

export const adminUserUpdateSchema = z.object({
  username: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9._-]+$/).optional(),
  email: z.email().trim().max(254).transform((value) => value.toLowerCase()).optional(),
  fullName: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(24).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  active: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "Cần gửi ít nhất một trường cần cập nhật.",
});
