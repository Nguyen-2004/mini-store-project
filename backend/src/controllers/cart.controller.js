import { asyncHandler } from "../utils/async-handler.js";
import { sendData } from "../utils/response.js";
import { addCartItem, clearCart, getCart, removeCartItem, setCartItemQuantity } from "../services/cart.service.js";

export const getMyCart = asyncHandler(async (req, res) => sendData(res, await getCart(req.user.id)));
export const addItem = asyncHandler(async (req, res) => sendData(res, await addCartItem(req.user.id, req.body.productId, req.body.quantity), 201));
export const updateItem = asyncHandler(async (req, res) => sendData(res, await setCartItemQuantity(req.user.id, req.params.productId, req.body.quantity)));
export const deleteItem = asyncHandler(async (req, res) => sendData(res, await removeCartItem(req.user.id, req.params.productId)));
export const deleteCart = asyncHandler(async (req, res) => sendData(res, await clearCart(req.user.id)));
