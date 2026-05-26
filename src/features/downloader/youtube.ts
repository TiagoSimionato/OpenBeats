import type { ReleaseResponse, ReleaseTrack } from 'services/mbApi/types';
import { execFile } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { getArtistLabel, getTrackTitle } from './utils';

const YT_DLP_BIN = process.env.YT_DLP_BIN ?? 'yt-dlp';
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
    '--paths',
    libraryPath,
    `https://www.youtube.com/watch?v=${videoId}`,
  ], {
    maxBuffer: 10 * 1024 * 1024,
  });

  return stdout.trim();
};
