import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Create connection pool (reuse in development)
const pool =
  globalForPrisma.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

// Create adapter
const adapter = new PrismaPg(pool);

function newPrismaClient(): PrismaClient {
  return new PrismaClient({ adapter });
}

/**
 * In dev, `globalThis.prisma` survives HMR. After `prisma generate` adds a model,
 * the cached client may not expose new delegates (`undefined.findFirst`).
 * Drop and recreate when we detect a known-new model is missing.
 */
function isStaleDevClient(client: PrismaClient): boolean {
  return !("auditExportJob" in client);
}

let prisma: PrismaClient;

if (process.env.NODE_ENV !== "production") {
  const existing = globalForPrisma.prisma;
  if (existing && isStaleDevClient(existing)) {
    void existing.$disconnect().catch(() => {});
    prisma = newPrismaClient();
  } else {
    prisma = existing ?? newPrismaClient();
  }
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
} else {
  prisma = globalForPrisma.prisma ?? newPrismaClient();
}

export { prisma };
