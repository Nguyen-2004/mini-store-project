import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminUsername = process.env.ADMIN_USERNAME?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
const adminFullName = process.env.ADMIN_FULL_NAME?.trim() || "Mini Store Administrator";

if (!databaseUrl || !adminEmail || !adminUsername || !adminPassword) {
  throw new Error("DATABASE_URL, ADMIN_EMAIL, ADMIN_USERNAME and ADMIN_PASSWORD are required to seed the database.");
}
if (adminPassword.length < 12) {
  throw new Error("ADMIN_PASSWORD must contain at least 12 characters.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
const categories = [
  { id: "11111111-1111-4111-8111-111111111111", name: "Sữa & đồ uống", slug: "sua-do-uong" },
  { id: "22222222-2222-4222-8222-222222222222", name: "Bánh & ngũ cốc", slug: "banh-ngu-coc" },
  { id: "33333333-3333-4333-8333-333333333333", name: "Trái cây", slug: "trai-cay" },
  { id: "44444444-4444-4444-8444-444444444444", name: "Thực phẩm", slug: "thuc-pham" },
];
const products = [
  { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1", name: "Sữa tươi nguyên chất", categoryId: categories[0].id, price: 35000, unit: "Hộp 1 lít", stock: 42, image: "/products/milk.svg", description: "Sữa tươi thơm nhẹ, vị béo tự nhiên. Một lựa chọn đơn giản cho bữa sáng của cả gia đình." },
  { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2", name: "Bánh mì thủ công", categoryId: categories[1].id, price: 28000, unit: "Ổ 300g", stock: 24, image: "/products/bread.svg", description: "Bánh mì vỏ giòn với ruột mềm, thích hợp dùng cùng bơ, mứt hoặc làm sandwich." },
  { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3", name: "Cam vàng mọng nước", categoryId: categories[2].id, price: 65000, unit: "Túi 1kg", stock: 36, image: "/products/orange.svg", description: "Cam vàng tươi, vị ngọt thanh xen chút chua nhẹ." },
  { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4", name: "Trứng gà tươi", categoryId: categories[3].id, price: 42000, unit: "Hộp 10 quả", stock: 30, image: "/products/eggs.svg", description: "Trứng gà tiện lợi cho những món ăn hằng ngày." },
  { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5", name: "Cà phê rang mộc", categoryId: categories[0].id, price: 89000, unit: "Gói 250g", stock: 18, image: "/products/coffee.svg", description: "Cà phê rang mộc hương thơm đậm, phù hợp pha phin." },
  { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6", name: "Rau xanh theo mùa", categoryId: categories[3].id, price: 22000, unit: "Bó 500g", stock: 28, image: "/products/greens.svg", description: "Rau xanh cho bữa cơm gia đình, cần rửa sạch trước khi chế biến." },
];

try {
  for (const category of categories) {
    await prisma.category.upsert({ where: { slug: category.slug }, create: category, update: {} });
  }
  for (const product of products) {
    await prisma.product.upsert({ where: { id: product.id }, create: product, update: {} });
  }
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  const usernameOwner = await prisma.user.findUnique({ where: { username: adminUsername } });
  if (usernameOwner && usernameOwner.id !== existingAdmin?.id) {
    throw new Error("ADMIN_USERNAME is already used by a different account.");
  }
  if (existingAdmin) {
    await prisma.user.update({ where: { id: existingAdmin.id }, data: { username: adminUsername, fullName: adminFullName, role: "ADMIN", isActive: true } });
  } else {
    await prisma.user.create({
      data: {
        username: adminUsername,
        email: adminEmail,
        fullName: adminFullName,
        role: "ADMIN",
        passwordHash: await bcrypt.hash(adminPassword, 12),
      },
    });
  }
  console.info(JSON.stringify({ level: "info", message: "Seed finished", categories: categories.length, products: products.length, admin: adminEmail }));
} finally {
  await prisma.$disconnect();
}
