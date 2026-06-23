import type { Track } from './types';
import { execFile } from 'node:child_process';
import { rename } from 'node:fs/promises';
import { basename, dirname, extname, join } from 'node:path';
import { promisify } from 'node:util';
import { CONFIGS } from 'configs';

const execFileAsync = promisify(execFile);

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
