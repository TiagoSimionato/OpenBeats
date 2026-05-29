import { existsSync } from 'node:fs';
import { join } from 'node:path';

const CACHE_PATH = process.env.CACHE_PATH ?? `/opt/lostbeats`;

export const CONFIGS = {
  ALLOWED_DEV_ORIGINS: JSON.parse(process.env.ALLOWED_DEV_ORIGINS ?? ''),
  CACHE_PATH,
  COVERS_PATH: `${CACHE_PATH}/covers`,
  DOWNLOAD_PATH: process.env.DOWNLOAD_PATH ?? '/data',
  FFMPEG_BIN: process.env.FFMPEG_BIN ?? 'ffmpeg',
  FFPROBE_BIN: process.env.FFPROBE_BIN ?? 'ffprobe',
  PYTHON_BIN: process.env.PYTHON_BIN ?? 'python3',
  YT_DLP_BIN: process.env.YT_DLP_BIN ?? 'yt-dlp',
  YTMUSIC_SCRIPT_PATH: join(process.cwd(), 'src', 'backend', 'downloader', 'search_ytmusic.py'),
} as const;

if (!existsSync(CONFIGS.YTMUSIC_SCRIPT_PATH))
  throw new Error('Cannot find ytmusic script');
