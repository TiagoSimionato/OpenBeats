import type { CoverResponse } from 'common/types/requests/caaApi';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { isAxiosError } from 'axios';
import { caaApi } from 'common/api/caaApi';
import { CONFIGS } from 'configs/constants';
import { handlePromise } from 'tsm-utils';

const makeWebp = async (imagePath: string) => {
  const child = spawn(
    process.execPath,
    ['src/backend/scripts/imagemin.mjs', imagePath, CONFIGS.THUMBNAILS_PATH],
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
  const thumbDir = resolve(CONFIGS.THUMBNAILS_PATH);

  if (!existsSync(coverDir) || !existsSync(thumbDir)) {
    return undefined;
  }

  const candidates = ['.jpg', '.jpeg', '.png', '.webp'];
  const extension = candidates.find((extension) => {
    if (existsSync(join(coverDir, `${releaseId}${extension}`))) {
      return true;
    }
    return false;
  });
  const thumbnailPath = join(thumbDir, `${releaseId}.webp`);
  const existsThumb = existsSync(thumbnailPath);

  if (extension && existsThumb) {
    return join(coverDir, `${releaseId}${extension}`);
  }
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
  async ({ releaseId, title }: { releaseId: string; title: string }) => {
    const existingCoverFilePath = await getCoverFilePath(releaseId);

    if (existingCoverFilePath) {
      console.log(`cover art: cover already exists for release [${title}]`);
      return existingCoverFilePath;
    }

    const coverResponse = await caaApi.get<CoverResponse>(`release/${releaseId}`).catch((error) => {
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

    const imageSrc = coverImage.thumbnails?.[1200] ?? coverImage.image;

    const coverFilePath = join(
      resolve(CONFIGS.COVERS_PATH),
      `${releaseId}${getCoverFileExtension(imageSrc)}`,
    );
    await saveCAAImage(coverFilePath, imageSrc);

    const thumbnailUrl = coverImage.thumbnails?.small ?? coverImage.thumbnails[250];
    if (thumbnailUrl) {
      const thumbnailPath = join(
        resolve(CONFIGS.THUMBNAILS_PATH),
        `${releaseId}${getCoverFileExtension(thumbnailUrl)}`,
      );
      await saveCAAImage(thumbnailPath, thumbnailUrl, true);
    }

    console.log(`cover art: added new cover art for release [${title}]`);

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
