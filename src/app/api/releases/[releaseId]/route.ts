import type { DownloadJobProgress, ReleaseSearchResponse, StartDownloadResponse, Track, TrackSearchResult } from 'backend/downloader/types';
import type { ReleaseResponse } from 'services/mbApi/types';
import { createDownloadJob, updateDownloadJob } from 'backend/downloader/jobs';
import { mapReleaseTracksToDownloadTracks } from 'backend/downloader/utils';
import { downloadReleaseCoverArt, downloadTrackAudio, searchYouTubeMusic, writeTrackMetadata } from 'backend/downloader/youtube';
import { withErrorHandler } from 'backend/exceptions/handler';
import { NextResponse } from 'next/server';
import { mbApi } from 'services/mbApi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MUSICBRAINZ_RELEASE_INC = 'media+recordings+artist-credits+release-groups+labels+tags';

type RouteContext = {
  params: Promise<{
    releaseId: string;
  }>;
};

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
    totalTracks: tracks.length,
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
    const query = `${track.title} - ${track.artist}`;
    const artist = track.artist;
    const processedTracks = index + 1;

    try {
      onProgress?.({
        currentTrackTitle: track.title,
        message: `Searching video for ${track.title}`,
        processedTracks,
        stage: 'search',
      });

      const results: { videoId: string }[] = await searchYouTubeMusic(query);
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
        query,
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
        query,
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

export const GET = withErrorHandler(async (_request: Request, { params }: RouteContext) => {
  const { releaseId } = await params;
  const response = await downloadReleaseAndCollect(releaseId);

  return NextResponse.json<ReleaseSearchResponse>(response);
});

export const POST = withErrorHandler(async (_request: Request, { params }: RouteContext) => {
  const { releaseId } = await params;
  const release = await mbApi.get<ReleaseResponse>(`release/${releaseId}`, {
    params: {
      inc: MUSICBRAINZ_RELEASE_INC,
    },
  });
  const totalTracks = mapReleaseTracksToDownloadTracks(release).length;
  const jobId = createDownloadJob({ totalTracks });

  void downloadReleaseAndCollect(releaseId, partial => updateDownloadJob(jobId, {
    ...partial,
    status: 'running',
  }))
    .then(() => {
      updateDownloadJob(jobId, {
        message: 'Download completed',
        processedTracks: totalTracks,
        stage: 'completed',
        status: 'completed',
      });
    })
    .catch((error: unknown) => {
      updateDownloadJob(jobId, {
        error: error instanceof Error ? error.message : 'Unknown job failure',
        message: 'Download failed',
        stage: 'failed',
        status: 'failed',
      });
    });

  return NextResponse.json<StartDownloadResponse>({
    jobId,
  }, {
    status: 202,
  });
});
