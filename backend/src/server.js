import { env } from "./config/env.js";
import { prisma } from "./config/database.js";
import app from "./app.js";

await prisma.$connect();
const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.info(JSON.stringify({ level: "info", message: "Mini Store API listening", port: env.PORT, environment: env.NODE_ENV }));
});

async function shutdown(signal) {
  console.info(JSON.stringify({ level: "info", message: "Stopping API", signal }));
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
