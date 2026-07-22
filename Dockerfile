FROM node:22-alpine AS deps
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
# build-base for better-sqlite3
RUN apk add --no-cache build-base
COPY . .
RUN yarn next telemetry disable
RUN yarn build

FROM node:22-alpine AS runner
ENV NODE_ENV=production
RUN apk add --no-cache yt-dlp \
  ffmpeg
WORKDIR /app

# cp node module: imagemin is missing
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 5334
ENV PORT=5334
ENV HOSTNAME=0.0.0.0
ENV NODE_OPTIONS="--network-family-autoselection-attempt-timeout=750"

CMD ["node", "server.js"]
