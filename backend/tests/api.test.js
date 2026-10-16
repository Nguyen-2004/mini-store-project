import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { prisma } from "../src/config/database.js";
import app from "../src/app.js";

let adminToken;
let userToken;
let secondUserToken;
let productId;
let categoryId;
const createdOrders = [];
const suffix = Date.now().toString();
const userEmail = "api-test-" + suffix + "@example.test";
const secondEmail = "api-test-second-" + suffix + "@example.test";

before(async () => {
  await prisma.$connect();
  const adminLogin = await request(app).post("/api/auth/login").send({
    identifier: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  assert.equal(adminLogin.status, 200, "Seeded admin account should be available");
  adminToken = adminLogin.body.data.token;
  const dashboard = await request(app).get("/api/admin/dashboard").set("Authorization", "Bearer " + adminToken);
  assert.equal(dashboard.status, 200);
  assert.equal(typeof dashboard.body.data.totals.revenue, "number");
  const categories = await request(app).get("/api/categories");
  assert.equal(categories.status, 200);
  categoryId = categories.body.data[0].id;
});

after(async () => {
  if (createdOrders.length) await prisma.order.deleteMany({ where: { id: { in: createdOrders } } });
  if (productId) {
    await prisma.cartItem.deleteMany({ where: { productId } });
    await prisma.wishlistItem.deleteMany({ where: { productId } });
    await prisma.product.deleteMany({ where: { id: productId } });
  }
  await prisma.user.deleteMany({ where: { email: { in: [userEmail, secondEmail] } } });
  await prisma.$disconnect();
});

test("auth, role boundaries, product validation, cart, checkout and order ownership", async () => {
  const registration = await request(app).post("/api/auth/register").send({
    username: "api-test-" + suffix,
    email: userEmail,
    fullName: "API Test User",
    password: "Test-Password-123",
  });
  assert.equal(registration.status, 201);
  assert.equal(registration.body.data.user.role, "user");
  assert.equal("passwordHash" in registration.body.data.user, false);
  userToken = registration.body.data.token;

  const invalidLogin = await request(app).post("/api/auth/login").send({
    identifier: userEmail,
    password: "wrong-password",
  });
  assert.equal(invalidLogin.status, 401);

  const secondRegistration = await request(app).post("/api/auth/register").send({
    username: "api-test-second-" + suffix,
    email: secondEmail,
    fullName: "Second API User",
    password: "Test-Password-123",
  });
  assert.equal(secondRegistration.status, 201);
  secondUserToken = secondRegistration.body.data.token;

  const badToken = await request(app).get("/api/cart").set("Authorization", "Bearer invalid");
  assert.equal(badToken.status, 401);
  const forbidden = await request(app).get("/api/admin/dashboard").set("Authorization", "Bearer " + userToken);
  assert.equal(forbidden.status, 403);
  const updatedProfile = await request(app).patch("/api/users/me").set("Authorization", "Bearer " + userToken).send({
    fullName: "API Test User Updated", email: userEmail, phone: "0901234567",
  });
  assert.equal(updatedProfile.status, 200);
  assert.equal(updatedProfile.body.data.fullName, "API Test User Updated");

  const address = await request(app).post("/api/users/addresses").set("Authorization", "Bearer " + userToken).send({
    name: "Nhà", recipient: "Test User", phone: "0901234567", street: "1 Test Street", city: "Ho Chi Minh City",
  });
  assert.equal(address.status, 201);
  assert.equal(address.body.data.isDefault, true);
  const foreignAddress = await request(app).patch(`/api/users/addresses/${address.body.data.id}/default`).set("Authorization", "Bearer " + secondUserToken);
  assert.equal(foreignAddress.status, 404);
  const deletedAddress = await request(app).delete(`/api/users/addresses/${address.body.data.id}`).set("Authorization", "Bearer " + userToken);
  assert.equal(deletedAddress.status, 200);

  const adminUsers = await request(app).get("/api/admin/users?limit=100").set("Authorization", "Bearer " + adminToken);
  assert.equal(adminUsers.status, 200);
  assert.equal(adminUsers.body.data.items.some((item) => item.email === userEmail), true);
  const adminCategories = await request(app).get("/api/admin/categories").set("Authorization", "Bearer " + adminToken);
  assert.equal(adminCategories.status, 200);

  const badProduct = await request(app).post("/api/admin/products").set("Authorization", "Bearer " + adminToken).send({
    name: "Invalid product",
    description: "Invalid price test",
    price: -1,
    stock: 2,
    image: "/products/test.svg",
    categoryId,
  });
  assert.equal(badProduct.status, 400);

  const createdProduct = await request(app).post("/api/admin/products").set("Authorization", "Bearer " + adminToken).send({
    name: "API test product " + suffix,
    description: "Short-lived integration-test product",
    price: 10,
    stock: 2,
    image: "/products/milk.svg",
    unit: "Cái",
    categoryId,
    active: true,
  });
  assert.equal(createdProduct.status, 201);
  productId = createdProduct.body.data.id;

  const favorite = await request(app).post("/api/users/wishlist/items").set("Authorization", "Bearer " + userToken).send({ productId });
  assert.equal(favorite.status, 201);
  const wishlist = await request(app).get("/api/users/wishlist").set("Authorization", "Bearer " + userToken);
  assert.equal(wishlist.body.data.some((item) => item.id === productId), true);
  assert.equal((await request(app).delete(`/api/users/wishlist/items/${productId}`).set("Authorization", "Bearer " + userToken)).status, 200);

  const passwordChange = await request(app).post("/api/auth/change-password").set("Authorization", "Bearer " + userToken).send({
    currentPassword: "Test-Password-123", newPassword: "Another-Password-456",
  });
  assert.equal(passwordChange.status, 200);
  const newPasswordLogin = await request(app).post("/api/auth/login").send({ identifier: userEmail, password: "Another-Password-456" });
  assert.equal(newPasswordLogin.status, 200);

  const listed = await request(app).get("/api/products?q=API%20test%20product");
  assert.equal(listed.status, 200);
  assert.equal(listed.body.data.items.some((item) => item.id === productId), true);

  const addToCart = await request(app).post("/api/cart/items").set("Authorization", "Bearer " + userToken).send({ productId, quantity: 2, price: 0 });
  assert.equal(addToCart.status, 201);
  assert.equal(addToCart.body.data.total, 20, "Cart total must use the database price, not a submitted price");

  await prisma.product.update({ where: { id: productId }, data: { stock: 1 } });
  const insufficientStock = await request(app).post("/api/orders").set("Authorization", "Bearer " + userToken).send({
    shippingAddress: { recipient: "Test User", phone: "0901234567", street: "1 Test Street", city: "Ho Chi Minh City" },
  });
  assert.equal(insufficientStock.status, 409);
  assert.equal(await prisma.cartItem.count({ where: { userId: registration.body.data.user.id } }), 1, "Failed checkout must preserve cart items");

  await prisma.product.update({ where: { id: productId }, data: { stock: 2 } });
  const checkout = await request(app).post("/api/orders").set("Authorization", "Bearer " + userToken).send({
    shippingAddress: { recipient: "Test User", phone: "0901234567", street: "1 Test Street", city: "Ho Chi Minh City" },
    total: 0,
  });
  assert.equal(checkout.status, 201);
  assert.equal(checkout.body.data.total, 20);
  const firstOrderId = checkout.body.data.orderId;
  createdOrders.push(firstOrderId);
  assert.equal(await prisma.product.findUnique({ where: { id: productId } }).then((product) => product.stock), 0);

  const privateOrder = await request(app).get("/api/orders/" + checkout.body.data.id).set("Authorization", "Bearer " + secondUserToken);
  assert.equal(privateOrder.status, 404);
  const userOrder = await request(app).get("/api/orders/" + checkout.body.data.id).set("Authorization", "Bearer " + userToken);
  assert.equal(userOrder.status, 200);
  assert.equal(userOrder.body.data.items[0].price, 10);

  const cancelled = await request(app).post("/api/orders/" + checkout.body.data.id + "/cancel").set("Authorization", "Bearer " + userToken);
  assert.equal(cancelled.status, 200);
  assert.equal(cancelled.body.data.status, "Đã hủy");
  assert.equal(await prisma.product.findUnique({ where: { id: productId } }).then((product) => product.stock), 2, "Cancelling a processing order must restore stock");

  await request(app).post("/api/cart/items").set("Authorization", "Bearer " + userToken).send({ productId, quantity: 1 });
  const secondCheckout = await request(app).post("/api/orders").set("Authorization", "Bearer " + userToken).send({
    shippingAddress: { recipient: "Test User", phone: "0901234567", street: "1 Test Street", city: "Ho Chi Minh City" },
  });
  assert.equal(secondCheckout.status, 201);
  const createdOrder = secondCheckout.body.data.orderId;
  createdOrders.push(createdOrder);

  const status = await request(app).patch("/api/admin/orders/" + createdOrder + "/status").set("Authorization", "Bearer " + adminToken).send({ status: "Đang giao" });
  assert.equal(status.status, 200);
  assert.equal(status.body.data.status, "Đang giao");
  const completed = await request(app).patch("/api/admin/orders/" + createdOrder + "/status").set("Authorization", "Bearer " + adminToken).send({ status: "Hoàn thành" });
  assert.equal(completed.status, 200);
  assert.equal(completed.body.data.status, "Hoàn thành");
});
