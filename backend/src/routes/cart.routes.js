import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { addItem, deleteCart, deleteItem, getMyCart, updateItem } from "../controllers/cart.controller.js";
import { cartItemSchema, quantitySchema } from "../validators/commerce.schemas.js";

const router = Router();
router.use(authenticate);
router.get("/", getMyCart);
router.post("/items", validate(cartItemSchema), addItem);
router.patch("/items/:productId", validate(quantitySchema), updateItem);
router.delete("/items/:productId", deleteItem);
router.delete("/", deleteCart);
export default router;
