// ./prisma.config.ts
import { defineConfig, env } from "@prisma/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Point specifically to the backend schema from the root
  schema: path.join(__dirname, "packages/backend/prisma/schema.prisma"),
  migrations: {
    path: path.join(__dirname, "packages/backend/prisma/migrations"),
  },
  datasource: {
    // Provide a placeholder to satisfy Prisma 7 build-time validation
    url: env("DATABASE_URL") || "postgresql://build_placeholder:5432/db",
  },
});
