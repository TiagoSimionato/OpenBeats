import type { ReleaseResponse, ReleaseTrack } from 'services/mbApi/types';
import type { Track } from './types';
import { execFile } from 'node:child_process';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { getArtistLabel, getTrackTitle } from './utils';

const YT_DLP_BIN = process.env.YT_DLP_BIN ?? 'yt-dlp';
const FFMPEG_BIN = process.env.FFMPEG_BIN ?? 'ffmpeg';
const PYTHON_BIN = process.env.PYTHON_BIN ?? 'python3';
const DOWNLOAD_PATH = process.env.DOWNLOAD_PATH ?? '/data';
const CACHE_PATH = process.env.CACHE_PATH ?? `/opt/lostbeats`;
const COVERS_PATH = `${CACHE_PATH}/covers`;
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
  track,
  videoId,
}: {
  track?: Track;
  videoId: string;
}) => {
  if (!DOWNLOAD_PATH) {
    throw new Error('DOWNLOAD_PATH is not defined');
  }

  const absoluteLibraryPath = resolve(DOWNLOAD_PATH);
  await mkdir(absoluteLibraryPath, { recursive: true });

  const sanitize = (s: string) =>
    s
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/[<>:"/\\|?*-]/g, '')
      .replace(/\.+$/g, '');

  const padTrack = (n: number) => String(n ?? 0).padStart(2, '0');

  let outputTemplate: string;

  if (track) {
    const albumArtist = sanitize(track.album_artist || 'Unknown Artist');
    const album = sanitize(track.album || 'Unknown Album');
    const title = sanitize(track.title || 'Untitled');
    const trackNumber = padTrack(Number(track.track ?? 0));

    const dir = join(absoluteLibraryPath, albumArtist, album);
    await mkdir(dir, { recursive: true });

    outputTemplate = join(dir, `${trackNumber}. ${title}.%(ext)s`);
  }
  else {
    outputTemplate = join(absoluteLibraryPath, '%(title)s.%(ext)s');
  }

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
    outputTemplate,
    '--print',
    'after_move:filepath',
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

const getCoverFileExtension = (contentType: null | string) => {
  if (contentType?.includes('png')) {
    return '.png';
  }

  if (contentType?.includes('webp')) {
    return '.webp';
  }

  return '.jpg';
};

export const downloadReleaseCoverArt = async (releaseId: string) => {
  if (!COVERS_PATH) {
    throw new Error('COVERS_PATH is not defined');
  }

  const response = await fetch(`https://coverartarchive.org/release/${releaseId}/front`);

  if (!response.ok) {
    throw new Error(`Cover Art Archive request failed with status ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  const coverFilePath = join(COVERS_PATH, `${releaseId}${getCoverFileExtension(contentType)}`);

  await mkdir(dirname(coverFilePath), { recursive: true });

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(coverFilePath, buffer);

  return {
    contentType,
    coverFilePath,
  };
};

export const writeTrackMetadata = async ({
  coverFilePath,
  filePath,
  track,
}: {
  coverFilePath?: string;
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

  const ffmpegArgs = coverFilePath
    ? [
        '-y',
        '-i',
        filePath,
        '-i',
        coverFilePath,
        '-map',
        '0:0',
        '-map',
        '1:0',
        '-id3v2_version',
        '3',
        ...metadataArgs,
        tempFilePath,
      ]
    : [
        '-y',
        '-i',
        filePath,
        '-map',
        '0',
        '-c',
        'copy',
        ...metadataArgs,
        tempFilePath,
      ];

  const { stdout } = await execFileAsync(FFMPEG_BIN, ffmpegArgs, {
    maxBuffer: 10 * 1024 * 1024,
  });

  await rename(tempFilePath, filePath);

  return stdout.trim();
};
