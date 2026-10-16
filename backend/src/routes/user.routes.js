import { Router } from "express";
import { z } from "zod";
import { authenticate, requireRole } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { addWishlistItem, createAddress, createAdminUser, deleteAddress, deleteAdminUser, getAddresses, getAdminUsers, getProfile, getWishlist, removeWishlistItem, setDefaultAddress, updateAddress, updateAdminUser, updateProfile } from "../controllers/user.controller.js";
import { addressSchema, addressUpdateSchema } from "../validators/commerce.schemas.js";
import { adminUserCreateSchema, adminUserUpdateSchema, profileUpdateSchema } from "../validators/user.schemas.js";

const router = Router();
router.use(authenticate);
router.get("/me", getProfile);
router.patch("/me", validate(profileUpdateSchema), updateProfile);
router.get("/addresses", getAddresses);
router.post("/addresses", validate(addressSchema), createAddress);
router.patch("/addresses/:id", validate(addressUpdateSchema), updateAddress);
router.patch("/addresses/:id/default", setDefaultAddress);
router.delete("/addresses/:id", deleteAddress);
router.get("/wishlist", getWishlist);
router.post("/wishlist/items", validate(z.object({ productId: z.uuid() })), addWishlistItem);
router.delete("/wishlist/items/:productId", removeWishlistItem);

export const adminUsersRouter = Router();
adminUsersRouter.use(authenticate, requireRole("ADMIN"));
adminUsersRouter.get("/", validate(z.object({
  q: z.string().trim().max(120).optional(),
  status: z.enum(["active", "inactive", "all"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}), "query"), getAdminUsers);
adminUsersRouter.post("/", validate(adminUserCreateSchema), createAdminUser);
adminUsersRouter.patch("/:id", validate(adminUserUpdateSchema), updateAdminUser);
adminUsersRouter.delete("/:id", deleteAdminUser);
export default router;
