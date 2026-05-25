import "dotenv/config";
import { defineConfig } from "prisma/config";

/** Prisma CLI (migrate, db push, studio) uses a direct connection when poolers block migrations. */
const migrationDatabaseUrl =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL;

const shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL;

if (!migrationDatabaseUrl) {
  throw new Error(
    "Set DATABASE_URL (and optionally DIRECT_URL for pooled deployments).",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: migrationDatabaseUrl,
    ...(shadowDatabaseUrl ? { shadowDatabaseUrl } : {}),
  },
});
