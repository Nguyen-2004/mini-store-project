import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../config/database.js";
import { AppError } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";

export const authenticate = asyncHandler(async (req, _res, next) => {
  const authorization = req.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new AppError(401, "Vui lòng đăng nhập để tiếp tục.", "AUTH_REQUIRED");
  }

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    throw new AppError(401, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.", "INVALID_TOKEN");
  }
  if (!payload.sub) throw new AppError(401, "Token không hợp lệ.", "INVALID_TOKEN");

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) throw new AppError(401, "Tài khoản không còn hoạt động.", "ACCOUNT_INACTIVE");
  req.user = user;
  next();
});

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, "Bạn không có quyền thực hiện thao tác này.", "FORBIDDEN"));
    }
    next();
  };
}
