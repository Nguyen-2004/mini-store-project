import { prisma } from "./database.js";

const maxAttempts = Number(process.env.DB_CONNECT_ATTEMPTS || 30);
let lastError;
for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
  try {
    await prisma.$connect();
    await prisma.$queryRawUnsafe("SELECT 1");
    console.info(JSON.stringify({ level: "info", message: "Database connection ready" }));
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.warn(JSON.stringify({ level: "warn", message: "Waiting for database", attempt, maxAttempts }));
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
console.error(JSON.stringify({ level: "error", message: "Database did not become ready", error: lastError?.message }));
process.exit(1);
