import type { DownloadJobProgress, ReleaseSearchResponse, Track, TrackSearchResult } from 'backend/downloader/types';
import type { ReleaseResponse } from 'frontend/services/mbApi/types';
import { dirname } from 'node:path';
import { downloadReleaseCoverArt } from 'backend/downloader/coverArt';
import { writeTrackMetadata } from 'backend/downloader/ffmpeg';
import { getArtistLabel, mapReleaseTracksToDownloadTracks } from 'backend/downloader/utils';
import { downloadTrackAudio, searchYouTubeMusic } from 'backend/downloader/ytdlp';
import { upsertDownloadedRelease } from 'backend/downloads';
import { jobService } from 'backend/services/jobs';
import { mbApi } from 'frontend/services/mbApi';

const MUSICBRAINZ_RELEASE_INC = 'media+recordings+artist-credits+release-groups+labels+tags';

const downloadReleaseAndCollect = async (
  releaseId: string,
  onProgress?: (progress: Omit<Partial<DownloadJobProgress>, 'jobId'>) => void,
) => {
  const release = await mbApi.get<ReleaseResponse>(`release/${releaseId}`, {
    params: {
      inc: MUSICBRAINZ_RELEASE_INC,
    },
  });
  const tracks: Track[] = mapReleaseTracksToDownloadTracks(release);

  onProgress?.({
    message: 'Downloading cover art',
    stage: 'cover',
  });

  const coverResult: {
    coverError?: string;
    coverFilePath?: string;
  } = await downloadReleaseCoverArt(releaseId)
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

      const downloadResult: Awaited<ReturnType<typeof downloadTrackAudio>> = await downloadTrackAudio({ track, videoId });

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
          await upsertDownloadedRelease({
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
