import type { ReleaseResponse } from 'common/types/requests/mbApi';
import type { DownloadJobProgress, Track } from 'common/types/requests/releases';
import { writeTrackMetadata } from 'backend/binaries/ffmpeg';
import { runYtdlp, searchYouTubeMusic } from 'backend/binaries/ytdlp';
import { releasesRepository } from 'backend/repositories/releases.repository';
import { coverArtService } from 'backend/services/coverArt.service';
import { mapReleaseTracksToDownloadTracks } from 'backend/utils';
import { mbApi, MUSICBRAINZ_RELEASE_PARAMS } from 'common/api/mbApi';

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

  const results = await searchYouTubeMusic(track);
  const videoId = results ? results[0]?.videoId : undefined;
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

const ytdlpStep = async ({ track, videoId }: { track: Track; videoId: string }, onProgress?: OnProgress) => {
  onProgress?.({
    currentTrack: track.track,
    currentTrackTitle: track.title,
    message: `Downloading ${track.title}`,
    stage: 'download',
  });
  const trackPath = await runYtdlp({ track, videoId });
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
  coverFilePath?: string | undefined;
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
  track.coverPath = coverFilePath;
  track.trackPath = filePath;
};

const addReleaseToLibrary = async (
  releaseId: string,
  onProgress?: OnProgress,
) => {
  const { tracks } = await getReleaseMetadataStep(releaseId);

  const coverFilePath = await getCoverArtStep(tracks[0], onProgress);

  for (const track of tracks.values()) {
    const videoId = await searchYouTubeMusicStep(track, onProgress);
    if (!videoId) {
      continue;
    }

    const trackPath = await ytdlpStep({ track, videoId }, onProgress);
    if (!trackPath) {
      continue;
    }

    await metadataStep({ coverFilePath, filePath: trackPath, track }, onProgress);
  };

  releasesRepository.upsertRelease(tracks[0]);
  onProgress?.({
    currentTrack: tracks[0].Tracktotal,
    message: 'Download completed',
    stage: 'completed',
    status: 'completed',
  });
};

export const libraryManagerService = {
  addReleaseToLibrary,
};
