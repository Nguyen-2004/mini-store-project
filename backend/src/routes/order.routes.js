import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { cancelOrder, getAdminOrder, getAllOrders, getMyOrder, getMyOrders, placeOrder, setOrderStatus } from "../controllers/order.controller.js";
import { checkoutSchema, orderStatusSchema } from "../validators/commerce.schemas.js";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.enum(["Đang xử lý", "Đang giao", "Hoàn thành", "Đã hủy"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
const router = Router();
router.use(authenticate);
router.get("/", validate(querySchema, "query"), getMyOrders);
router.post("/", validate(checkoutSchema), placeOrder);
router.get("/:id", getMyOrder);
router.post("/:id/cancel", cancelOrder);

export const adminOrdersRouter = Router();
adminOrdersRouter.use(authenticate, requireRole("ADMIN"));
adminOrdersRouter.get("/", validate(querySchema, "query"), getAllOrders);
adminOrdersRouter.get("/:id", getAdminOrder);
adminOrdersRouter.patch("/:id/status", validate(orderStatusSchema), setOrderStatus);
export default router;
