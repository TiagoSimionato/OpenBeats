import type { ReleaseResponse, ReleaseTrack } from 'services/mbApi/types';
import type { Track } from './types';
import { execFile } from 'node:child_process';
import { mkdir, rename } from 'node:fs/promises';
import { basename, dirname, extname, join } from 'node:path';
import { promisify } from 'node:util';
import { getArtistLabel, getTrackTitle } from './utils';

const YT_DLP_BIN = process.env.YT_DLP_BIN ?? 'yt-dlp';
const FFMPEG_BIN = process.env.FFMPEG_BIN ?? 'ffmpeg';
const PYTHON_BIN = process.env.PYTHON_BIN ?? 'python3';
const YTMUSIC_SCRIPT_PATH = join(process.cwd(), 'src', 'features', 'downloader', 'search_ytmusic.py');

const execFileAsync = promisify(execFile);

export const buildTrackQuery = (track: ReleaseTrack, release: ReleaseResponse) => {
  const title = getTrackTitle(track);
  const artistLabel = getArtistLabel(
    track['artist-credit'] ?? track.recording?.['artist-credit'] ?? release['artist-credit'],
  );

  return `${title} - ${artistLabel}`;
};

export const searchYouTubeMusic = async (query: string) => {
  const { stdout } = await execFileAsync(PYTHON_BIN, [
    YTMUSIC_SCRIPT_PATH,
    query,
    '1',
  ], {
    maxBuffer: 10 * 1024 * 1024,
  });

  return JSON.parse(stdout) as { videoId: string }[];
};

export const downloadTrackAudio = async ({
  videoId,
}: {
  videoId: string;
}) => {
  const libraryPath = process.env.LIBRARY_PATH;

  if (!libraryPath) {
    throw new Error('LIBRARY_PATH is not defined');
  }

  await mkdir(libraryPath, { recursive: true });

  const { stdout } = await execFileAsync(YT_DLP_BIN, [
    '--ignore-errors',
    '--format',
    'bestaudio',
    '--extract-audio',
    '--audio-format',
    'mp3',
    '--audio-quality',
    '160K',
    '--output',
    '%(title)s.%(ext)s',
    '--print',
    'after_move:filepath',
    '--paths',
    libraryPath,
    `https://www.youtube.com/watch?v=${videoId}`,
  ], {
    maxBuffer: 10 * 1024 * 1024,
  });

  const output = stdout.trim();
  const filePath = output
    .split('\n')
    .map(line => line.trim())
    .findLast(line => line.length > 0);

  if (!filePath) {
    throw new Error('yt-dlp did not return a downloaded file path');
  }

  return {
    filePath,
    output,
  };
};

export const writeTrackMetadata = async ({
  filePath,
  track,
}: {
  filePath: string;
  track: Track;
}) => {
  const tempFilePath = join(
    dirname(filePath),
    `${basename(filePath, extname(filePath))}.metadata${extname(filePath)}`,
  );

  const metadataArgs = Object.entries(track).flatMap(([key, value]) => {
    if (value === undefined || value === null) {
      return [];
    }

    const metadataValue = Array.isArray(value) ? value.join('; ') : String(value);

    return [
      '-metadata',
      `${key}=${metadataValue}`,
    ];
  });

  const { stdout } = await execFileAsync(FFMPEG_BIN, [
    '-y',
    '-i',
    filePath,
    '-map',
    '0',
    '-c',
    'copy',
    ...metadataArgs,
    tempFilePath,
  ], {
    maxBuffer: 10 * 1024 * 1024,
  });

  await rename(tempFilePath, filePath);

  return stdout.trim();
};
