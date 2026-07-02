import type { ReleaseResponse } from 'common/types/requests/mbApi';
import type { DownloadJobProgress, Track, TrackSearchResult } from 'common/types/requests/releases';
import { dirname } from 'node:path';
import { writeTrackMetadata } from 'backend/binaries/ffmpeg';
import { runYtdlp, searchYouTubeMusic } from 'backend/binaries/ytdlp';
import { releasesRepository } from 'backend/repositories/releases.repository';
import { coverArtService } from 'backend/services/coverArt.service';
import { mapReleaseTracksToDownloadTracks } from 'backend/utils';
import { mbApi, MUSICBRAINZ_RELEASE_PARAMS } from 'common/api/mbApi';

const addReleaseToLibrary = async (
  releaseId: string,
  onProgress?: (progress: Omit<Partial<DownloadJobProgress>, 'jobId'>) => void,
) => {
  const release = await mbApi.get<ReleaseResponse>(`release/${releaseId}`, {
    params: MUSICBRAINZ_RELEASE_PARAMS,
  });
  const tracks: Track[] = mapReleaseTracksToDownloadTracks(release);

  onProgress?.({
    message: 'Downloading cover art',
    stage: 'cover',
  });

  const coverResult: {
    coverError?: string;
    coverFilePath?: string;
  } = await coverArtService.getReleaseCoverArt(release)
    .catch((error) => {
      console.error(error.message);
      return {
        coverError: error instanceof Error ? error.message : 'Unknown cover download error',
        coverFilePath: undefined,
      };
    });

  const trackSearches: TrackSearchResult[] = [];

  for (const [index, track] of tracks.entries()) {
    const currentTrack = index + 1;

    onProgress?.({
      currentTrack,
      currentTrackTitle: track.title,
      message: `Searching video for ${track.title}`,
      stage: 'search',
    });

    const results = await searchYouTubeMusic(track);
    const videoId = results[0]?.videoId;

    if (!videoId) {
      onProgress?.({
        currentTrack,
        currentTrackTitle: track.title,
        error: 'No YTMusic videoId found',
      });
      continue;
    }

    onProgress?.({
      currentTrack,
      currentTrackTitle: track.title,
      message: `Downloading ${track.title}`,
      stage: 'download',
    });
    const ytdlpResult = await runYtdlp({ track, videoId });

    onProgress?.({
      currentTrack,
      currentTrackTitle: track.title,
      message: `Tagging ${track.title}`,
      stage: 'metadata',
    });
    await writeTrackMetadata({
      coverFilePath: coverResult.coverFilePath,
      filePath: ytdlpResult.filePath,
      track,
    });

    trackSearches.push({
      coverFilePath: coverResult.coverFilePath,
      downloadedFilePath: ytdlpResult.filePath,
    });
  }
  const firstDownloadedTrack = trackSearches[0];

  if (firstDownloadedTrack?.downloadedFilePath) {
    await releasesRepository.upsertDownloadedRelease({
      album: tracks[0].album,
      albumArtist: tracks[0].artist,
      completedAt: new Date().toISOString(),
      coverPath: firstDownloadedTrack.coverFilePath,
      downloadPath: dirname(firstDownloadedTrack.downloadedFilePath),
      releaseId: release.id,
      trackCount: tracks.length,
    });
  }
  onProgress?.({
    currentTrack: trackSearches.length,
    message: 'Download completed',
    stage: 'completed',
    status: 'completed',
  });
};

export const libraryManagerService = {
  addReleaseToLibrary,
};
