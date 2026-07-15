import type { TrackRequestParams } from 'common/types/requests/library';
import type { ReleaseResponse } from 'common/types/requests/mbApi';
import type { DownloadJobProgress, Track } from 'common/types/requests/releases';
import { rm } from 'node:fs/promises';
import { writeTrackMetadata } from 'backend/binaries/ffmpeg';
import { runYtdlp, searchYouTubeMusic } from 'backend/binaries/ytdlp';
import { NotFoundError } from 'backend/exceptions/http';
import { releasesRepository } from 'backend/repositories/releases.repository';
import { coverArtService } from 'backend/services/coverArt.service';
import { mbApi, MUSICBRAINZ_RELEASE_PARAMS } from 'common/api/mbApi';
import { mapReleaseTracksToDownloadTracks } from 'common/utils';

type OnProgress = ((progress: Omit<Partial<DownloadJobProgress>, 'jobId'>) => void) | undefined;

const getReleaseMetadataStep = async (releaseId: string) => {
  const release = await mbApi.get<ReleaseResponse>(`release/${releaseId}`, {
    params: MUSICBRAINZ_RELEASE_PARAMS,
  });

  return {
    release,
    tracks: mapReleaseTracksToDownloadTracks(release),
  };
};

const getCoverArtStep = async (track: Track, onProgress?: OnProgress): Promise<string | undefined> => {
  onProgress?.({
    message: 'Downloading cover art',
    stage: 'cover',
  });

  const coverFilePath = await coverArtService.getReleaseCoverArt(track);

  return coverFilePath;
};

const searchYouTubeMusicStep = async (track: Track, onProgress?: OnProgress) => {
  onProgress?.({
    currentTrack: track.track,
    currentTrackTitle: track.title,
    message: `Searching video for ${track.title}`,
    stage: 'search',
  });

  const videoId = await searchYouTubeMusic(track);
  if (!videoId) {
    onProgress?.({
      currentTrack: track.track,
      currentTrackTitle: track.title,
      error: 'No YTMusic videoId found',
    });
    console.log(`ytmusic: no result found for [${track.title}]`);
  }

  return videoId;
};

const ytdlpStep = async ({ isCustomUrl, track, videoId }: { isCustomUrl?: boolean; track: Track; videoId: string }, onProgress?: OnProgress) => {
  onProgress?.({
    currentTrack: track.track,
    currentTrackTitle: track.title,
    message: `Downloading ${track.title}`,
    stage: 'download',
  });
  const trackPath = await runYtdlp({ isCustomUrl, track, videoId });
  track.trackPath = trackPath;
  if (!trackPath) {
    onProgress?.({
      currentTrack: track.track,
      currentTrackTitle: track.title,
      error: 'ytdlp error',
    });
  }
  return trackPath;
};

const metadataStep = async ({ coverFilePath, filePath, track }: {
  coverFilePath?: string;
  filePath: string;
  track: Track;
}, onProgress?: OnProgress) => {
  onProgress?.({
    currentTrack: track.track,
    currentTrackTitle: track.title,
    message: `Tagging ${track.title}`,
    stage: 'metadata',
  });
  await writeTrackMetadata({
    coverFilePath,
    filePath,
    track,
  });
};

const addToLibrary = async (tracks: Track[], onProgress?: OnProgress, customUrl?: string) => {
  const coverFilePath = await getCoverArtStep(tracks[0], onProgress);

  tracks[0].coverPath = coverFilePath;
  releasesRepository.upsertRelease(tracks[0]);

  for (const track of tracks.values()) {
    track.coverPath = coverFilePath;

    let trackPath;
    if (!customUrl) {
      const videoId = await searchYouTubeMusicStep(track, onProgress);
      if (!videoId) {
        continue;
      }

      trackPath = await ytdlpStep({ track, videoId }, onProgress);
    }
    if (customUrl) {
      console.log(`using custom url: ${customUrl}`);
      trackPath = await ytdlpStep({ isCustomUrl: true, track, videoId: customUrl }, onProgress);
    }
    if (!trackPath) {
      continue;
    }

    await metadataStep({ coverFilePath, filePath: trackPath, track }, onProgress);

    await releasesRepository.upsertLibraryTrack({
      disc: track.disc,
      downloadPath: trackPath,
      genre: track.genre.join('; '),
      id: track['MusicBrainz Track Id'],
      musicBrainzReleaseTrackId: track['MusicBrainz Release Track Id'],
      musicBrainzTrackId: track['MusicBrainz Track Id'],
      releaseId: track['MusicBrainz Album Id'],
      title: track.title,
      trackNumber: track.track,
    });
  };

  onProgress?.({
    currentTrack: tracks[0].Tracktotal,
    message: 'Download completed',
    stage: 'completed',
    status: 'completed',
  });
  console.log(`finished adding ${tracks.length === 1 ? tracks[0].title : tracks[0].album} to the library`);
};

const addReleaseToLibrary = async (
  releaseId: string,
  onProgress?: OnProgress,
) => {
  const { tracks } = await getReleaseMetadataStep(releaseId);

  const libraryRelease = await releasesRepository.getLibraryRelease(releaseId);
  const missingTracks = tracks.filter(it =>
    !(libraryRelease?.tracks.find(libraryTrack => libraryTrack.id === it['MusicBrainz Track Id'])),
  );

  addToLibrary(missingTracks, onProgress);
};

const addTrackToLibrary = async (
  { releaseId, trackId, url }: TrackRequestParams,
  onProgress?: OnProgress,
) => {
  const { tracks: releaseTracks } = await getReleaseMetadataStep(releaseId);

  const track = releaseTracks.find(it => it['MusicBrainz Track Id'] === trackId);

  if (!track) {
    onProgress?.({
      error: 'Release does not contain requested track',
      stage: 'failed',
      status: 'failed',
    });
    return;
  }

  addToLibrary([track], onProgress, url);
};

const deleteTrack = async ({ releaseId, trackId }: TrackRequestParams) => {
  const release = await releasesRepository.getLibraryRelease(releaseId);

  if (!release)
    throw new NotFoundError('Release not found');

  const track = release.tracks.find(it => it.id === trackId);

  if (track?.downloadPath) {
    await rm(track.downloadPath).catch(() => {});
  }

  releasesRepository.deleteTrack(trackId);
  if (release.tracks.length === 1)
    releasesRepository.deleteRelease(releaseId);
};

const deleteRelease = async (releaseId: string) => {
  const release = await releasesRepository.getLibraryRelease(releaseId);

  if (!release)
    throw new NotFoundError('Release not found');

  release.tracks.forEach((track) => {
    rm(track.downloadPath).catch(() => {});
  });

  releasesRepository.deleteRelease(releaseId);
};

export const libraryManagerService = {
  addReleaseToLibrary,
  addTrackToLibrary,
  deleteRelease,
  deleteTrack,
};
