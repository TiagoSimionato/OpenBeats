import type { CoverResponse } from 'frontend/services/caaApi/queries/covers';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { caaApi } from 'common/api/caaApi';
import { CONFIGS } from 'configs';

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
