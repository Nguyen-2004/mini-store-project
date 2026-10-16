import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { sendData } from "../utils/response.js";
import { serializeUser } from "../utils/serializers.js";

function issueToken(user) {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN,
    algorithm: "HS256",
  });
}

export const register = asyncHandler(async (req, res) => {
  const values = req.body;
  const user = await prisma.user.create({
    data: {
      username: values.username.toLowerCase(),
      email: values.email,
      fullName: values.fullName,
      phone: values.phone || null,
      passwordHash: await bcrypt.hash(values.password, 12),
      role: "USER",
    },
  });
  sendData(res, { user: serializeUser(user), token: issueToken(user) }, 201);
});

export const login = asyncHandler(async (req, res) => {
  const identifier = req.body.identifier.toLowerCase();
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
  });
  if (!user || !user.isActive || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    throw new AppError(401, "Tên đăng nhập hoặc mật khẩu không đúng.", "INVALID_CREDENTIALS");
  }
  sendData(res, { user: serializeUser(user), token: issueToken(user) });
});

export const me = asyncHandler(async (req, res) => sendData(res, serializeUser(req.user)));

export const changePassword = asyncHandler(async (req, res) => {
  const matches = await bcrypt.compare(req.body.currentPassword, req.user.passwordHash);
  if (!matches) throw new AppError(400, "Mật khẩu hiện tại chưa đúng.", "CURRENT_PASSWORD_INVALID");
  const passwordHash = await bcrypt.hash(req.body.newPassword, 12);
  await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
  sendData(res, { message: "Đã cập nhật mật khẩu." });
});
