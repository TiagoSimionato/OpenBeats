import type { CoverResponse } from 'services/caaApi/queries/covers';
import type { ReleaseResponse, ReleaseTrack } from 'services/mbApi/types';
import type { Track } from './types';
import { execFile } from 'node:child_process';
import { mkdir, readdir, rename, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { CONFIGS } from 'configs';
import { caaApi } from 'services/caaApi';
import { getArtistLabel, getTrackTitle } from './utils';

const execFileAsync = promisify(execFile);

export const buildTrackQuery = (track: ReleaseTrack, release: ReleaseResponse) => {
  const title = getTrackTitle(track);
  const artistLabel = getArtistLabel(
    track['artist-credit'] ?? track.recording?.['artist-credit'] ?? release['artist-credit'],
  );

  return `${title} - ${artistLabel}`;
};

export const searchYouTubeMusic = async (query: string) => {
  const { stdout } = await execFileAsync(CONFIGS.PYTHON_BIN, [
    CONFIGS.YTMUSIC_SCRIPT_PATH,
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
  const absoluteLibraryPath = resolve(CONFIGS.DOWNLOAD_PATH);
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

  const { stdout } = await execFileAsync(CONFIGS.YT_DLP_BIN, [
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

const getCoverFileExtension = (sourcePathOrUrl: string) => extname(sourcePathOrUrl) || '.jpg';

const getExistingCoverFilePath = async (releaseId: string) => {
  const coverDir = resolve(CONFIGS.COVERS_PATH);
  let entries;

  try {
    entries = await readdir(coverDir, { withFileTypes: true });
  }
  catch {
    return undefined;
  }

  const existingCoverEntry = entries.find(entry => entry.isFile() && entry.name.startsWith(`${releaseId}.`));

  return existingCoverEntry ? join(coverDir, existingCoverEntry.name) : undefined;
};

export const downloadReleaseCoverArt = async (releaseId: string) => {
  const existingCoverFilePath = await getExistingCoverFilePath(releaseId);

  if (existingCoverFilePath) {
    return {
      coverFilePath: existingCoverFilePath,
    };
  }

  const coverResponse = await caaApi.get<CoverResponse>(`release/${releaseId}`);
  const coverImage = coverResponse.images?.find(image => image.front) ?? coverResponse.images?.[0];

  if (!coverImage?.image) {
    throw new Error('Cover Art Archive did not return a downloadable cover image');
  }

  const coverImageUrl = new URL(coverImage.image);
  const coverFilePath = join(
    resolve(CONFIGS.COVERS_PATH),
    `${releaseId}${getCoverFileExtension(coverImageUrl.pathname)}`,
  );

  await mkdir(dirname(coverFilePath), { recursive: true });

  const coverImageResponse = await caaApi.get<ArrayBuffer>(coverImage.image, {
    responseType: 'arraybuffer',
  });

  const buffer = Buffer.from(coverImageResponse);
  await writeFile(coverFilePath, buffer);

  return {
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

  const { stdout } = await execFileAsync(CONFIGS.FFMPEG_BIN, ffmpegArgs, {
    maxBuffer: 10 * 1024 * 1024,
  });

  await rename(tempFilePath, filePath);

  return stdout.trim();
};
