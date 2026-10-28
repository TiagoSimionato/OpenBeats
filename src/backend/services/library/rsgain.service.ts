import type { OnProgress } from '.';
import { dirname } from 'node:path';
import { runRsgain } from 'backend/binaries/rsgain';
import { releasesRepository } from 'backend/repositories/releases.repository';

const tagLibrary = async () => {
  const releases = await releasesRepository.listLibraryReleases();

  for (const release of releases) {
    await runRsgain({
      directoryPath: dirname(release.tracks[0].downloadPath),
      title: release.album,
    });
  }
};

const tagRelease = async ({ albumDirectoryPath, title }: {
  albumDirectoryPath: string;
  title: string;
}, onProgress?: OnProgress) => {
  onProgress?.({
    currentTrackTitle: title,
    message: `Adding gain tag to ${title}`,
    stage: 'metadata',
  });
  await runRsgain({
    directoryPath: albumDirectoryPath,
    title,
  });
};

export const rsGainService = {
  tagLibrary,
  tagRelease,
};
