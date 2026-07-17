import type { CoverResponse } from 'common/types/requests/caaApi';
import type { Track } from 'common/types/requests/releases';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { isAxiosError } from 'axios';
import { caaApi } from 'common/api/caaApi';
import { CONFIGS } from 'configs/constants';
import { handlePromise } from 'tsm-utils';

const makeWebp = async (imagePath: string) => {
  const child = spawn(
    process.execPath,
    ['--import', 'tsx', 'src/backend/scripts/imagemin.mts', imagePath, CONFIGS.THUMBNAILS_PATH],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );

  let stderr = '';
  child.stderr.on('data', (d) => {
    stderr += d.toString();
  });

  const [code] = await once(child, 'close') as [number];
  if (code !== 0) {
    throw new Error(`cover conversion failed (${code}): ${stderr}`);
  }
};

const getCoverFileExtension = (sourcerUrl: string) =>
  extname(sourcerUrl) || '.jpg'
;

const getCoverFilePath = async (releaseId: string) => {
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

const saveCAAImage = async (imagePath: string, url: string, isThumbnail?: boolean) => {
  await mkdir(dirname(imagePath), { recursive: true });

  const imageResponse = await caaApi.get<ArrayBuffer>(url, {
    responseType: 'arraybuffer',
  });

  const buffer = Buffer.from(imageResponse);
  await writeFile(imagePath, buffer);

  if (isThumbnail && getCoverFileExtension(imagePath) !== '.webp') {
    await makeWebp(imagePath);
    await rm(imagePath);
  }
};

const getReleaseCoverArt = handlePromise(
  async (track: Track) => {
    const existingCoverFilePath = await getCoverFilePath(track['MusicBrainz Album Id']);

    if (existingCoverFilePath) {
      console.log(`cover art: cover already exists for release [${track.album}]`);
      return existingCoverFilePath;
    }

    const coverResponse = await caaApi.get<CoverResponse>(`release/${track['MusicBrainz Album Id']}`).catch((error) => {
      if (isAxiosError(error) && error.status === 404) {
        return undefined;
      }
      console.log(`Unkown cover response error: ${error}`);
    });
    if (!coverResponse) {
      console.log('cover art: no artwork found for this release');
      return;
    }

    const coverImage = coverResponse.images?.find(image => image.front) ?? coverResponse.images?.[0];

    if (!coverImage?.image) {
      throw new Error('Cover Art Archive did not return a downloadable cover image');
    }

    const coverFilePath = join(
      resolve(CONFIGS.COVERS_PATH),
      `${track['MusicBrainz Album Id']}${getCoverFileExtension(coverImage.image)}`,
    );
    await saveCAAImage(coverFilePath, coverImage.image);

    const thumbnailUrl = coverImage.thumbnails?.small ?? coverImage.thumbnails?.[250];
    if (thumbnailUrl) {
      const thumbnailPath = join(
        resolve(CONFIGS.THUMBNAILS_PATH),
        `${track['MusicBrainz Album Id']}${getCoverFileExtension(thumbnailUrl)}`,
      );
      await saveCAAImage(thumbnailPath, thumbnailUrl, true);
    }

    console.log(`cover art: added new cover art for release [${track.album}]`);

    return coverFilePath;
  },
  (error) => {
    console.error(`cover art: ${error.message}`);
  },
);

export const coverArtService = {
  getCoverFilePath,
  getReleaseCoverArt,
};
