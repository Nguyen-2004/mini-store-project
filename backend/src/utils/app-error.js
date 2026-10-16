export class AppError extends Error {
  constructor(status, message, code = "REQUEST_FAILED", details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (message = "Không tìm thấy dữ liệu.") =>
  new AppError(404, message, "NOT_FOUND");
