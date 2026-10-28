import type { TrackRequestParams } from 'common/types/requests/library';
import type { Track } from 'common/types/requests/releases';
import type { OnProgress } from '.';
import { writeFile } from 'node:fs/promises';
import { dirname, extname } from 'node:path';
import { releasesRepository } from 'backend/repositories/releases.repository';
import { makeTrackPath } from 'backend/utils';
import { coversManagerService } from './cover.service';
import { downloaderService } from './downloader.service';
import { metadataService } from './metadata.service';
import { rsGainService } from './rsgain.service';

const addTrackstep = async ({ customUrl, file, track }: { customUrl?: string; file?: File; track: Track }, onProgress?: OnProgress) => {
  const libraryRelease = await releasesRepository.getLibraryRelease(track['MusicBrainz Album Id']);
  const libraryTrack = libraryRelease?.tracks.find(it => it.musicBrainzTrackId === track['MusicBrainz Track Id']);
  if (libraryTrack)
    track.trackPath = libraryTrack.downloadPath;

  if (file) {
    if (track.trackPath) {
      const fileExtension = extname(track.trackPath);
      const trackPathExtensionless = track.trackPath.slice(0, -fileExtension.length || undefined);
      track.trackPath = `${trackPathExtensionless}${extname(file.name)}`;
    }
    else {
      track.trackPath = `${await makeTrackPath(track)}${extname(file.name)}`;
    }

    const bytes = await file.arrayBuffer();
    await writeFile(track.trackPath, Buffer.from(bytes));

    return true;
  }

  if (customUrl) {
    console.log(`using custom url: ${customUrl}`);
    await downloaderService.ytdlpStep({ isCustomUrl: true, track, videoId: customUrl }, onProgress);
    return !!track.trackPath;
  }

  const videoId = await downloaderService.searchYouTubeMusicStep(track, onProgress);
  if (!videoId) {
    return false;
  }
  await downloaderService.ytdlpStep({ track, videoId }, onProgress);

  return !!track.trackPath;
};

const addToLibrary = async (tracks: Track[], onProgress?: OnProgress, customUrl?: string, file?: File) => {
  const coverFilePath = await coversManagerService.getCoverArtStep(tracks[0], onProgress);

  tracks[0].coverPath = coverFilePath;
  await releasesRepository.upsertRelease(tracks[0]);

  for (const track of tracks.values()) {
    const isSuccess = await addTrackstep({ customUrl, file, track }, onProgress);
    if (isSuccess) {
      await metadataService.writeTrackMetadata({ track }, onProgress);
      releasesRepository.upsertTrack(track);
    }
  };

  const title = tracks.length === 1 ? tracks[0].title : tracks[0].album;
  const firstTrackPath = tracks.find(it => !!it.trackPath)?.trackPath;

  if (firstTrackPath) {
    await rsGainService.tagRelease({
      albumDirectoryPath: dirname(firstTrackPath),
      title,
    });
    onProgress?.({
      currentTrack: tracks[0].Tracktotal,
      message: 'Download completed',
      stage: 'completed',
      status: 'completed',
    });
  }
  if (!firstTrackPath) {
    onProgress?.({
      message: 'Failed',
      stage: 'failed',
      status: 'failed',
    });
  }

  console.log(`finished adding ${title} to the library`);
};

const addReleaseToLibrary = async (
  releaseId: string,
  onProgress?: OnProgress,
) => {
  const metadata = await metadataService.fetchReleaseMetadata(releaseId, onProgress);
  const tracks = metadata?.tracks;
  if (tracks) {
    const libraryRelease = await releasesRepository.getLibraryRelease(releaseId);
    const missingTracks = tracks.filter(it =>
      !(libraryRelease?.tracks.find(libraryTrack => libraryTrack.id === it['MusicBrainz Track Id'])),
    );

    await addToLibrary(missingTracks, onProgress);
  }
};

const addTrackToLibrary = async (
  { file, releaseId, trackId, url }: TrackRequestParams & { file?: File },
  onProgress?: OnProgress,
) => {
  const metadata = await metadataService.fetchReleaseMetadata(releaseId, onProgress);
  const releaseTracks = metadata?.tracks;
  if (releaseTracks) {
    const track = releaseTracks.find(it => it['MusicBrainz Track Id'] === trackId || it['MusicBrainz Release Track Id'] === trackId);

    if (!track) {
      onProgress?.({
        error: 'Release does not contain requested track',
        stage: 'failed',
        status: 'failed',
      });
      return;
    }

    await addToLibrary([track], onProgress, url, file);
  }
};

export const addLibraryService = {
  addReleaseToLibrary,
  addTrackToLibrary,
};
