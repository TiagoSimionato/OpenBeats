import { join } from 'node:path';

const CACHE_PATH = process.env.CACHE_PATH ?? `/opt/openbeats`;

export const CONFIGS = {
  ALLOWED_DEV_ORIGINS: JSON.parse(process.env.ALLOWED_DEV_ORIGINS ?? '[]'),
  AUTH_SECRET: process.env.AUTH_SECRET ?? 'b4af04a83acf45a28230adc6727d4411',
  CACHE_PATH,
  COVERS_PATH: `${CACHE_PATH}/covers`,
  DB_PATH: join(CACHE_PATH, `openbeats.db`),
  DEFAULT_PASSWORD: process.env.DEFAULT_PASSWORD,
  DEFAULT_USER: process.env.DEFAULT_USER ?? 'admin',
  DOWNLOAD_PATH: process.env.DOWNLOAD_PATH ?? '/data',
  FFMPEG_BIN: process.env.FFMPEG_BIN ?? 'ffmpeg',
  FFPROBE_BIN: process.env.FFPROBE_BIN ?? 'ffprobe',
  LOG_INCOMING_REQUESTS: Boolean(process.env.LOG_INCOMING_REQUESTS ?? false),
  RSGAIN_BIN: process.env.RSGAIN_BIN ?? 'rsgain',
  THUMBNAILS_PATH: `${CACHE_PATH}/thumbnails`,
  YT_DLP_BIN: process.env.YT_DLP_BIN ?? 'yt-dlp',
} as const;

export const CUSTOM_HEADERS = {
  PATH_NAME: 'x-pathname',
};
