# ── Stage 1: 의존성 설치 ──────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: 빌드 ────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 빌드 시점에 DB 연결이 필요 없으므로 더미값으로 채움
# 실제 값은 컨테이너 실행 시 환경변수로 주입
ENV DATABASE_URL=placeholder
RUN npm run build

# ── Stage 3: 프로덕션 런타임 ─────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# standalone 빌드 결과물 복사
COPY --from=builder /app/public                      ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 환경변수는 docker run -e 또는 docker-compose env_file 로 주입
CMD ["node", "server.js"]
