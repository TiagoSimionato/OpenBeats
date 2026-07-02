import type { CoverResponse } from 'common/types/requests/caaApi';
import type { ReleaseResponse } from 'common/types/requests/mbApi';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { caaApi } from 'common/api/caaApi';
import { CONFIGS } from 'configs/constants';

const getCoverFileExtension = (sourcePathOrUrl: string) => extname(sourcePathOrUrl) || '.jpg';

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

const getReleaseCoverArt = async (release: ReleaseResponse) => {
  const existingCoverFilePath = await getCoverFilePath(release.id);

  if (existingCoverFilePath) {
    console.log(`cover art: cover already exists for release [${release.title}]`);
    return {
      coverFilePath: existingCoverFilePath,
    };
  }

  const coverResponse = await caaApi.get<CoverResponse>(`release/${release.id}`);
  const coverImage = coverResponse.images?.find(image => image.front) ?? coverResponse.images?.[0];

  if (!coverImage?.image) {
    throw new Error('Cover Art Archive did not return a downloadable cover image');
  }

  const coverImageUrl = new URL(coverImage.image);
  const coverFilePath = join(
    resolve(CONFIGS.COVERS_PATH),
    `${release.id}${getCoverFileExtension(coverImageUrl.pathname)}`,
  );

  await mkdir(dirname(coverFilePath), { recursive: true });

  const coverImageResponse = await caaApi.get<ArrayBuffer>(coverImage.image, {
    responseType: 'arraybuffer',
  });

  const buffer = Buffer.from(coverImageResponse);
  await writeFile(coverFilePath, buffer);

  console.log(`cover art: added new cover art for release [${release.title}]`);

  return {
    coverFilePath,
  };
};

export const coverArtService = {
  getCoverFilePath,
  getReleaseCoverArt,
};
