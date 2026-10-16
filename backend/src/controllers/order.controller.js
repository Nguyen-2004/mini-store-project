import { asyncHandler } from "../utils/async-handler.js";
import { sendData } from "../utils/response.js";
import { cancelOwnOrder, changeOrderStatus, createOrder, getOrder, listOrders } from "../services/order.service.js";

export const getMyOrders = asyncHandler(async (req, res) => sendData(res, await listOrders({ userId: req.user.id, query: req.validated.query })));
export const getMyOrder = asyncHandler(async (req, res) => sendData(res, await getOrder(req.params.id, req.user.id)));
export const placeOrder = asyncHandler(async (req, res) => sendData(res, await createOrder(req.user.id, req.body), 201));
export const cancelOrder = asyncHandler(async (req, res) => sendData(res, await cancelOwnOrder(req.params.id, req.user.id)));
export const getAllOrders = asyncHandler(async (req, res) => sendData(res, await listOrders({ query: req.validated.query, admin: true })));
export const getAdminOrder = asyncHandler(async (req, res) => sendData(res, await getOrder(req.params.id, null, true)));
export const setOrderStatus = asyncHandler(async (req, res) => sendData(res, await changeOrderStatus(req.params.id, req.body.status)));
