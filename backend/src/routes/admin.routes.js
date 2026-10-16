import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/authenticate.js";
import { getDashboard } from "../controllers/admin.controller.js";

const router = Router();
router.use(authenticate, requireRole("ADMIN"));
router.get("/dashboard", getDashboard);
export default router;
