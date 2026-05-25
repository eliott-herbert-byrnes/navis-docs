FROM node:20-alpine AS base
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

FROM base AS deps
WORKDIR /app
# postinstall runs prisma generate — schema + prisma.config.ts must exist first
ENV DATABASE_URL=postgresql://postgres:password@localhost:5432/navis_docs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma.config.ts reads DATABASE_URL; a placeholder is enough for generate + build
ARG DATABASE_URL=postgresql://postgres:password@localhost:5432/navis_docs
ENV DATABASE_URL=$DATABASE_URL
# NEXT_PUBLIC_ vars must be passed as build args
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_DEPLOY_MODE=self-hosted
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_DEPLOY_MODE=$NEXT_PUBLIC_DEPLOY_MODE
RUN pnpm prisma generate && pnpm build
# Materialize Prisma CLI + its pnpm-linked deps for migrate deploy (root node_modules are symlinks)
RUN mkdir -p /tmp/prisma-migrate/node_modules && \
    for d in /app/node_modules/.pnpm/prisma@*/node_modules; do \
      if [ -d "$d" ]; then cp -rL "$d"/. /tmp/prisma-migrate/node_modules/; break; fi; \
    done && \
    mkdir -p /tmp/prisma-migrate/node_modules/.bin && \
    cp -rL /app/node_modules/.bin/prisma /tmp/prisma-migrate/node_modules/.bin/prisma && \
    test -f /tmp/prisma-migrate/node_modules/prisma/package.json

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache wget
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /tmp/prisma-migrate/node_modules/ ./node_modules/
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh && \
    chown -R node:node /app
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1
ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
