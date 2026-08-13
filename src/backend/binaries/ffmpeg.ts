import type { Track } from 'common/types/requests/releases';
import { randomUUID } from 'node:crypto';
import { copyFile, rm } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { coverArtService } from 'backend/services/coverArt.service';
import { execFileAsync } from 'backend/utils';
import { CONFIGS } from 'configs/constants';
import { handlePromise } from 'tsm-utils';

export const writeTrackMetadata = handlePromise(
  async ({
    track,
  }: {
    track: Track;
  }) => {
    if (!track.trackPath) {
      console.log(`ffmpeg: [${track.title}] did not have a path`);
      return;
    }

    const coverFilePath = await coverArtService.getCoverFilePath(track['MusicBrainz Album Id']);

    const tmpFilePath = join(
      resolve(CONFIGS.CACHE_PATH),
      `${randomUUID()}.metadata${extname(track.trackPath)}`,
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
          track.trackPath,
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
          tmpFilePath,
        ]
      : [
          '-y',
          '-i',
          track.trackPath,
          '-map',
          '0',
          '-c:a',
          'libmp3lame',
          '-b:a',
          '160K',
          '-c',
          'copy',
          ...metadataArgs,
          tmpFilePath,
        ];

    const { stdout } = await execFileAsync(CONFIGS.FFMPEG_BIN, ffmpegArgs, {
      maxBuffer: 10 * 1024 * 1024,
    });

    console.log(`ffmpeg: tagged track [${track.title}]`);

    await copyFile(tmpFilePath, track.trackPath);
    await rm(tmpFilePath);

    return stdout.trim();
  },
  (error) => {
    console.log(`ffmpeg: ${error}`);
  },
);

export const getCoverFromTrack = handlePromise(async ({ filePath, releaseId, title }: { filePath: string; releaseId: string; title: string }) => {
  const coverFilePath = join(CONFIGS.COVERS_PATH, `${releaseId}.jpg`);
  await execFileAsync(CONFIGS.FFMPEG_BIN, [
    '-i',
    filePath,
    '-an',
    coverFilePath,
  ]);
  await coverArtService.makeWebp(coverFilePath);
  console.log(`ffmpeg: extracted cover art from [${title}]`);
  return true;
}, (error) => {
  if (!error.message.includes('Output file #0 does not contain any stream')) {
    console.log(`ffmpeg: ${error}`);
  }
});
