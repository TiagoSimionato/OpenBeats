import type { ReleaseResponse } from 'common/types/requests/mbApi';
import type { DownloadJobProgress, ReleaseSearchResponse, Track, TrackSearchResult } from 'common/types/requests/releases';
import { dirname } from 'node:path';
import { writeTrackMetadata } from 'backend/binaries/ffmpeg';
import { runYtdlp, searchYouTubeMusic } from 'backend/binaries/ytdlp';
import { coverArtService } from 'backend/services/coverArt.service';
import { dbService } from 'backend/services/db.service';
import { jobService } from 'backend/services/jobs.service';
import { getArtistLabel, mapReleaseTracksToDownloadTracks } from 'backend/utils';
import { mbApi, MUSICBRAINZ_RELEASE_PARAMS } from 'common/api/mbApi';

const downloadReleaseAndCollect = async (
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
  } = await coverArtService.getReleaseCoverArt(releaseId)
    .then(({ coverFilePath }) => ({
      coverFilePath,
    }))
    .catch(error => ({
      coverError: error instanceof Error ? error.message : 'Unknown cover download error',
      coverFilePath: undefined,
    }));

  const trackSearches: TrackSearchResult[] = [];

  for (const [index, track] of tracks.entries()) {
    const artist = track.artist;
    const processedTracks = index + 1;

    try {
      onProgress?.({
        currentTrackTitle: track.title,
        message: `Searching video for ${track.title}`,
        processedTracks,
        stage: 'search',
      });

      const results: { videoId: string }[] = await searchYouTubeMusic(track);
      const videoId = results[0]?.videoId;

      if (!videoId) {
        throw new Error('No YTMusic videoId found');
      }

      onProgress?.({
        currentTrackTitle: track.title,
        message: `Downloading ${track.title}`,
        processedTracks,
        stage: 'download',
      });

      const downloadResult: Awaited<ReturnType<typeof runYtdlp>> = await runYtdlp({ track, videoId });

      onProgress?.({
        currentTrackTitle: track.title,
        message: `Tagging ${track.title}`,
        processedTracks,
        stage: 'metadata',
      });

      const ffmpegOutput = await writeTrackMetadata({
        coverFilePath: coverResult.coverFilePath,
        filePath: downloadResult.filePath,
        track,
      });

      trackSearches.push({
        artist,
        coverError: coverResult.coverError,
        coverFilePath: coverResult.coverFilePath,
        downloadedFilePath: downloadResult.filePath,
        downloadOutput: downloadResult.output,
        ffmpegOutput,
        results,
        trackId: track['MusicBrainz Release Track Id'],
        trackTitle: track.title,
        videoId,
      });
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown download pipeline error';

      trackSearches.push({
        artist,
        coverError: coverResult.coverError,
        coverFilePath: coverResult.coverFilePath,
        results: [],
        trackId: track['MusicBrainz Release Track Id'],
        trackTitle: track.title,
        videoId: '',
        ytdlpError: message,
      });

      onProgress?.({
        currentTrackTitle: track.title,
        message,
        processedTracks,
      });
    }
  }

  return {
    release,
    trackSearches,
  } satisfies ReleaseSearchResponse;
};

const startDownloadJob = (releaseId: string): string => {
  const jobId = jobService.createDownloadJob();

  downloadReleaseAndCollect(releaseId, partial => jobService.updateDownloadJob(jobId, {
    ...partial,
    status: 'running',
  }))
    .then(async (response) => {
      const fullyDownloaded = response.trackSearches.length > 0
        && response.trackSearches.every(trackSearch => Boolean(trackSearch.downloadedFilePath));

      if (fullyDownloaded) {
        const firstDownloadedTrack = response.trackSearches.find(trackSearch => trackSearch.downloadedFilePath);

        if (firstDownloadedTrack?.downloadedFilePath) {
          await dbService.upsertDownloadedRelease({
            album: response.release.title ?? 'Unknown Album',
            albumArtist: getArtistLabel(response.release['artist-credit']),
            completedAt: new Date().toISOString(),
            coverPath: firstDownloadedTrack.coverFilePath,
            downloadPath: dirname(firstDownloadedTrack.downloadedFilePath),
            releaseId: response.release.id,
            trackCount: response.trackSearches.length,
          });
        }
      }

      jobService.updateDownloadJob(jobId, {
        message: 'Download completed',
        processedTracks: response.trackSearches.length,
        stage: 'completed',
        status: 'completed',
      });
    })
    .catch((error: unknown) => {
      jobService.updateDownloadJob(jobId, {
        error: error instanceof Error ? error.message : 'Unknown job failure',
        message: 'Download failed',
        stage: 'failed',
        status: 'failed',
      });
    });

  return jobId;
};

export const libraryManagerService = {
  startDownloadJob,
};
