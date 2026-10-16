import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env, corsOrigins } from "./config/env.js";
import { prisma } from "./config/database.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import authRoutes from "./routes/auth.routes.js";
import { adminCatalogRouter, categoryRouter, productRouter } from "./routes/catalog.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes, { adminOrdersRouter } from "./routes/order.routes.js";
import userRoutes, { adminUsersRouter } from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { asyncHandler } from "./utils/async-handler.js";
import { sendData } from "./utils/response.js";

const app = express();
app.disable("x-powered-by");
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
});
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || corsOrigins.includes(origin)) return callback(null, true);
    const error = new Error("Origin is not allowed by CORS.");
    error.status = 403;
    error.code = "CORS_ORIGIN_DENIED";
    callback(error);
  },
  credentials: false,
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev", {
  skip: (req) => req.path === "/health",
}));

app.get("/health", asyncHandler(async (_req, res) => {
  await prisma.$queryRawUnsafe("SELECT 1");
  sendData(res, { status: "ok", service: "mini-store-backend" });
}));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/users", adminUsersRouter);
app.use("/api/admin/orders", adminOrdersRouter);
app.use("/api/admin", adminCatalogRouter);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
