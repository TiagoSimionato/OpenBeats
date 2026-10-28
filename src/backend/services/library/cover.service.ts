import type { Track } from 'common/types/requests/releases';
import type { OnProgress } from '.';
import { rm, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { getCoverFromTrack } from 'backend/binaries/ffmpeg';
import { throwError } from 'backend/exceptions/handler';
import { UnprocessableEntityError } from 'backend/exceptions/http';
import { releasesRepository } from 'backend/repositories/releases.repository';
import { coverArtService } from 'backend/services/coverArt.service';
import { mapLibraryReleaseToTracks } from 'common/utils';
import { CONFIGS } from 'configs/constants';
import { metadataService } from './metadata.service';

const addReleaseCover = async ({ releaseId }: { releaseId: string }) => {
  const libraryRelease = await releasesRepository.getLibraryRelease(releaseId)
    ?? throwError(new UnprocessableEntityError('Release not found'));

  const existingCoverFilePath = await coverArtService.getCoverFilePath(releaseId);
  if (existingCoverFilePath) {
    await rm(existingCoverFilePath);
  }

  const coverFilePath = await coverArtService.getReleaseCoverArt({ releaseId, title: libraryRelease.album });
  if (coverFilePath) {
    libraryRelease.coverPath = libraryRelease.id;
    await releasesRepository.upsertLibraryRelease(libraryRelease);

    const tracks = mapLibraryReleaseToTracks(libraryRelease);
    for (const track of tracks) {
      await metadataService.writeTrackMetadata({ track });
    }

    return;
  }
  throw new UnprocessableEntityError('Could not add release cover');
};

const importReleaseCover = async ({ file, releaseId }: { file: File; releaseId: string }) => {
  const libraryRelease = await releasesRepository.getLibraryRelease(releaseId)
    ?? throwError(new UnprocessableEntityError('Release not found'));

  const existingCoverFilePath = await coverArtService.getCoverFilePath(releaseId);
  if (existingCoverFilePath) {
    await rm(existingCoverFilePath);
  }

  const coverFilePath = join(
    resolve(CONFIGS.COVERS_PATH),
    `${releaseId}${extname(file.name)}`,
  );

  const bytes = await file.arrayBuffer();
  await writeFile(coverFilePath, Buffer.from(bytes));
  await coverArtService.makeWebp(coverFilePath);

  if (!libraryRelease.coverPath) {
    libraryRelease.coverPath = libraryRelease.id;
    await releasesRepository.upsertLibraryRelease(libraryRelease);
  }

  const tracks = mapLibraryReleaseToTracks(libraryRelease);
  for (const track of tracks) {
    await metadataService.writeTrackMetadata({ track });
  }
};

const syncReleasesCover = async () => {
  const releases = await releasesRepository.listLibraryReleases();
  for (const release of releases) {
    if (!release.coverPath) {
      const isCoverArtArchiveSuccess = !!(await coverArtService.getReleaseCoverArt({ releaseId: release.id, title: release.album }));
      let isFFMPEGSuccess = false;

      for (const track of release.tracks) {
        if (isCoverArtArchiveSuccess || isFFMPEGSuccess)
          continue;
        isFFMPEGSuccess = !!(await getCoverFromTrack({ filePath: track.downloadPath, releaseId: release.id, title: release.album }));
      }

      const isSuccess = isCoverArtArchiveSuccess || isFFMPEGSuccess;
      if (isSuccess) {
        await releasesRepository.upsertLibraryRelease({
          ...release,
          coverPath: release.id,
        });
      }
    }
  }
};

const getCoverArtStep = async (track: Track, onProgress?: OnProgress): Promise<string | undefined> => {
  onProgress?.({
    message: 'Downloading cover art',
    stage: 'cover',
  });

  const coverFilePath = await coverArtService.getReleaseCoverArt({ releaseId: track['MusicBrainz Album Id'], title: track.album });

  return coverFilePath;
};

export const coversManagerService = {
  addReleaseCover,
  getCoverArtStep,
  importReleaseCover,
  syncReleasesCover,
};
