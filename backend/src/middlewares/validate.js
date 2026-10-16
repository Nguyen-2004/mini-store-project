import { AppError } from "../utils/app-error.js";

export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new AppError(400, "Dữ liệu gửi lên chưa hợp lệ.", "VALIDATION_ERROR", result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }))));
    }
    if (source === "query") req.validated = { ...req.validated, query: result.data };
    else req[source] = result.data;
    next();
  };
}
