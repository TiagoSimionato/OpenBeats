import type { Track } from 'common/types/requests/releases';
import { randomUUID } from 'node:crypto';
import { rename } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { execFileAsync } from 'backend/utils';
import { CONFIGS } from 'configs/constants';
import { handlePromise } from 'tsm-utils';

export const writeTrackMetadata = handlePromise(
  async ({
    coverFilePath,
    filePath,
    track,
  }: {
    coverFilePath?: string;
    filePath: string;
    track: Track;
  }) => {
    const tempFilePath = join( // UUID
      resolve(CONFIGS.CACHE_PATH),
      `${randomUUID()}.metadata${extname(filePath)}`,
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
          '-c:a',
          'libmp3lame',
          '-b:a',
          '160K',
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
          '-c:a',
          'libmp3lame',
          '-b:a',
          '160K',
          '-c',
          'copy',
          ...metadataArgs,
          tempFilePath,
        ];

    const { stdout } = await execFileAsync(CONFIGS.FFMPEG_BIN, ffmpegArgs, {
      maxBuffer: 10 * 1024 * 1024,
    });

    console.log(`ffmpeg: tagged track [${track.title}]`);

    await rename(tempFilePath, filePath);

    return stdout.trim();
  },
  (error) => {
    console.log(`ffmpeg: ${error}`);
  },
);
