import type { Track } from 'common/types/requests/releases';
import { rename } from 'node:fs/promises';
import { basename, dirname, extname, join } from 'node:path';
import { execFileAsync } from 'backend/utils';
import { CONFIGS } from 'configs';

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

  console.log(`ffmpeg tagged track ${track.title}`);

  await rename(tempFilePath, filePath);

  return stdout.trim();
};
