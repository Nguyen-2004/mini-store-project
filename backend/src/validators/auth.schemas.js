import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9._-]+$/),
  email: z.email().trim().max(254).transform((value) => value.toLowerCase()),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(24).optional().default(""),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(72),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(72),
  newPassword: z.string().min(8).max(72),
}).refine((value) => value.currentPassword !== value.newPassword, {
  message: "Mật khẩu mới phải khác mật khẩu hiện tại.",
  path: ["newPassword"],
});
