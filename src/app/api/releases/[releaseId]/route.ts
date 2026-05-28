import type { ReleaseSearchResponse, Track, TrackSearchResult } from 'backend/downloader/types';
import type { ReleaseResponse } from 'services/mbApi/types';
import { mapReleaseTracksToDownloadTracks } from 'backend/downloader/utils';
import { downloadReleaseCoverArt, downloadTrackAudio, searchYouTubeMusic, writeTrackMetadata } from 'backend/downloader/youtube';
import { withErrorHandler } from 'backend/exceptions/handler';
import { UnprocessableEntityError } from 'backend/exceptions/http';
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

export const GET = withErrorHandler(async (_request: Request, { params }: RouteContext) => {
  const { releaseId } = await params;
  const release = await mbApi.get<ReleaseResponse>(`release/${releaseId}`, {
    params: {
      inc: MUSICBRAINZ_RELEASE_INC,
    },
  });
  const tracks: Track[] = mapReleaseTracksToDownloadTracks(release);
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

  const trackSearches = await Promise.all(
    tracks.map(async (track) => {
      const query = `${track.title} - ${track.artist}`;
      const artist = track.artist;

      const results: { videoId: string }[] = await searchYouTubeMusic(query);

      const videoId = results[0]?.videoId;

      if (!videoId)
        throw new UnprocessableEntityError('No YTMusic videoId found');

      const downloadResult: Awaited<ReturnType<typeof downloadTrackAudio>> = await downloadTrackAudio({ track, videoId });

      const ffmpegOutput = await writeTrackMetadata({
        coverFilePath: coverResult.coverFilePath,
        filePath: downloadResult.filePath,
        track,
      });

      return {
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
      } satisfies TrackSearchResult;
    }),
  );

  return NextResponse.json<ReleaseSearchResponse>({
    release,
    trackSearches,
  });
});
