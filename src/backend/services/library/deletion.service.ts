import type { TrackRequestParams } from 'common/types/requests/library';
import { rm, rmdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { NotFoundError } from 'backend/exceptions/http';
import { releasesRepository } from 'backend/repositories/releases.repository';
import { CONFIGS } from 'configs/constants';
import { coverArtService } from '../coverArt.service';

const deleteRelease = async (releaseId: string) => {
  const release = await releasesRepository.getLibraryRelease(releaseId);

  if (!release)
    throw new NotFoundError('Release not found');

  let releaseDirectory: string = '';
  for (const track of release.tracks) {
    if (!releaseDirectory)
      releaseDirectory = dirname(track.downloadPath);

    await rm(track.downloadPath).catch(() => {});
  };
  if (releaseDirectory) {
    await rmdir(releaseDirectory).catch(() => {});
    const artistDirectory = dirname(`${releaseDirectory}.xpto`);
    await rmdir(artistDirectory).catch(() => {});
  }
  const coverPath = await coverArtService.getCoverFilePath(release.id);
  if (coverPath) {
    await rm(coverPath).catch(() => {});
  }
  await rm(`${CONFIGS.THUMBNAILS_PATH}/${release.id}.webp`).catch(() => {});

  await releasesRepository.deleteRelease(releaseId);
};

const deleteTrack = async ({ releaseId, trackId }: TrackRequestParams) => {
  const release = await releasesRepository.getLibraryRelease(releaseId);

  if (!release)
    throw new NotFoundError('Release not found');

  if (release.tracks.length === 1) {
    await deleteRelease(releaseId);
    return;
  }

  const track = release.tracks.find(it => it.id === trackId);

  if (track?.downloadPath) {
    await rm(track.downloadPath).catch(() => {});
  }

  releasesRepository.deleteTrack(trackId);
};

export const libraryDeletionService = {
  release: deleteRelease,
  track: deleteTrack,
};
