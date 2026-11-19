FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
# build-base for better-sqlite3
RUN apk add --no-cache build-base
COPY . .
RUN yarn prisma generate
RUN yarn next telemetry disable
RUN yarn build

FROM node:22-alpine AS runner
ENV NODE_ENV=production
RUN apk add --no-cache yt-dlp ffmpeg rsgain
WORKDIR /app

COPY --from=builder /app/.next/standalone ./
# cp node module: get prisma to work
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma7.config.ts ./
COPY --from=builder /app/src/backend/prisma ./src/backend/prisma

EXPOSE 5334
ENV PORT=5334
ENV HOSTNAME=0.0.0.0
ENV NODE_OPTIONS="--network-family-autoselection-attempt-timeout=750"

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
