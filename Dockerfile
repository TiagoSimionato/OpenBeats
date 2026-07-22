FROM node:22-alpine AS base
# build-base for better-sqlite3
RUN apk add --no-cache libc6-compat \
  build-base \
  yt-dlp \
  ffmpeg
WORKDIR /app

FROM base AS deps
ENV NODE_ENV=production
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn next telemetry disable
RUN yarn build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app


COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 5334
ENV PORT=5334
ENV HOSTNAME=0.0.0.0
ENV NODE_OPTIONS="--network-family-autoselection-attempt-timeout=750"

CMD ["node", "server.js"]
