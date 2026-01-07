// ./prisma.config.ts
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "packages/backend/prisma/schema.prisma",
  migrations: {
    path: "packages/backend/prisma/migrations",
    seed: "node packages/backend/prisma/seed.cjs"
  },
  datasource: {
    // Prisma 7 requires a valid URL format even for the fallback
    url: env("DATABASE_URL"),
  },
});
