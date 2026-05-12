FROM node:20-alpine AS base

WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

COPY --from=builder --chown=appuser:nodejs /app/packages/web/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/packages/web/package.json ./

USER appuser

EXPOSE 3000

CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
