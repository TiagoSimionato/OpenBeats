import type { CoverResponse } from 'common/types/requests/caaApi';
import type { Track } from 'common/types/requests/releases';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { isAxiosError } from 'axios';
import { caaApi } from 'common/api/caaApi';
import { CONFIGS } from 'configs/constants';
import { handlePromise } from 'tsm-utils';

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

const getReleaseCoverArt = handlePromise(
  async (track: Track) => {
    const existingCoverFilePath = await getCoverFilePath(track['MusicBrainz Album Id']);

    if (existingCoverFilePath) {
      console.log(`cover art: cover already exists for release [${track.title}]`);
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

    const coverImageUrl = new URL(coverImage.image);
    const coverFilePath = join(
      resolve(CONFIGS.COVERS_PATH),
      `${track['MusicBrainz Album Id']}${getCoverFileExtension(coverImageUrl.pathname)}`,
    );

    await mkdir(dirname(coverFilePath), { recursive: true });

    const coverImageResponse = await caaApi.get<ArrayBuffer>(coverImage.image, {
      responseType: 'arraybuffer',
    });

    const buffer = Buffer.from(coverImageResponse);
    await writeFile(coverFilePath, buffer);

    console.log(`cover art: added new cover art for release [${track.album}]`);

    return coverFilePath;
  },
  (error) => {
    console.log(`cover art: ${error.message}`);
  },
);

export const coverArtService = {
  getCoverFilePath,
  getReleaseCoverArt,
};
