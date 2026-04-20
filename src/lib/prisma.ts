import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { canonicalEmail } from "@/lib/email-canonical";

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
  const base = new PrismaClient({ adapter });
  const extended = base.$extends({
    query: {
      user: {
        create({ args, query }) {
          const data = args.data as { email?: string; canonicalEmail?: string };
          if (typeof data.email === "string" && data.canonicalEmail === undefined) {
            data.canonicalEmail = canonicalEmail(data.email);
          }
          return query(args);
        },
        upsert({ args, query }) {
          const create = args.create as {
            email?: string;
            canonicalEmail?: string;
          };
          if (
            typeof create.email === "string" &&
            create.canonicalEmail === undefined
          ) {
            create.canonicalEmail = canonicalEmail(create.email);
          }
          return query(args);
        },
      },
    },
  });
  return extended as unknown as PrismaClient;
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
