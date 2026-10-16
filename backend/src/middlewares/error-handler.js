import { Prisma } from "@prisma/client";
import { AppError } from "../utils/app-error.js";
import { env } from "../config/env.js";

export function notFoundHandler(req, _res, next) {
  next(new AppError(404, "Không tìm thấy API " + req.method + " " + req.path + ".", "ROUTE_NOT_FOUND"));
}

export function errorHandler(error, req, res, _next) {
  if (res.headersSent) return;
  let status = error.status || 500;
  let code = error.code || "INTERNAL_ERROR";
  let message = error.message || "Đã xảy ra lỗi máy chủ.";

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      status = 409;
      code = "DUPLICATE_VALUE";
      message = "Thông tin đã tồn tại.";
    } else if (error.code === "P2025") {
      status = 404;
      code = "NOT_FOUND";
      message = "Không tìm thấy dữ liệu.";
    } else if (error.code === "P2003") {
      status = 409;
      code = "RELATED_DATA_EXISTS";
      message = "Dữ liệu đang được sử dụng và không thể xóa.";
    }
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    status = 503;
    code = "DATABASE_UNAVAILABLE";
    message = "Database hiện chưa sẵn sàng. Vui lòng thử lại sau.";
  }

  if (status >= 500) {
    console.error(JSON.stringify({ level: "error", requestId: req.id, method: req.method, path: req.path, code, message: error.message }));
    if (env.NODE_ENV === "production") message = "Đã xảy ra lỗi máy chủ.";
  }
  res.status(status).json({
    error: {
      code,
      message,
      ...(error.details ? { details: error.details } : {}),
      ...(env.NODE_ENV !== "production" && status >= 500 ? { requestId: req.id } : {}),
    },
  });
}
