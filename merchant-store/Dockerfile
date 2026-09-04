# ───────────── Stage 1: Base Runtime ─────────────
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# ───────────── Stage 2: Install Dependencies ─────────────
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# ───────────── Stage 3: Build Application ─────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ───────────── Stage 4: Production Runner ─────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

CMD ["npm", "start"]
