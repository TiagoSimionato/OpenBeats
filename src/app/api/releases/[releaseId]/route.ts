import type { ReleaseSearchResponse, Track, TrackSearchResult } from 'features/downloader/types';
import type { ReleaseResponse } from 'services/mbApi/types';
import { mapReleaseTracksToDownloadTracks } from 'features/downloader/utils';
import { downloadTrackAudio, searchYouTubeMusic, writeTrackMetadata } from 'features/downloader/youtube';
import { NextResponse } from 'next/server';
import { mbApi } from 'services/mbApi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MUSICBRAINZ_RELEASE_INC = 'media+recordings+artist-credits+release-groups+labels';

type RouteContext = {
  params: Promise<{
    releaseId: string;
  }>;
};

export const GET = async (_request: Request, { params }: RouteContext) => {
  const { releaseId } = await params;
  const release = await mbApi.get<ReleaseResponse>(`release/${releaseId}`, {
    params: {
      inc: MUSICBRAINZ_RELEASE_INC,
    },
  });
  const tracks: Track[] = mapReleaseTracksToDownloadTracks(release);

  const trackSearches = await Promise.all(
    tracks.map(async (track) => {
      const query = `${track.title} - ${track.artist}`;
      const artist = track.artist;

      let results: { videoId: string }[];

      try {
        results = await searchYouTubeMusic(query);
      }
      catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown YTMusic search error';

        return {
          artist,
          query,
          results: [],
          trackId: track['MusicBrainz Release Track Id'],
          trackTitle: track.title,
          videoId: undefined,
          ytmusicError: message,
        } satisfies TrackSearchResult;
      }

      const videoId = results[0]?.videoId;

      if (!videoId) {
        return {
          artist,
          query,
          results,
          trackId: track['MusicBrainz Release Track Id'],
          trackTitle: track.title,
          ytmusicError: 'No YTMusic videoId found',
        } satisfies TrackSearchResult;
      }

      let downloadResult: Awaited<ReturnType<typeof downloadTrackAudio>>;

      try {
        downloadResult = await downloadTrackAudio({ videoId });
      }
      catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown yt-dlp error';

        return {
          artist,
          query,
          results,
          trackId: track['MusicBrainz Release Track Id'],
          trackTitle: track.title,
          videoId,
          ytdlpError: message,
        } satisfies TrackSearchResult;
      }

      try {
        const ffmpegOutput = await writeTrackMetadata({
          filePath: downloadResult.filePath,
          track,
        });

        return {
          artist,
          downloadedFilePath: downloadResult.filePath,
          downloadOutput: downloadResult.output,
          ffmpegOutput,
          query,
          results,
          trackId: track['MusicBrainz Release Track Id'],
          trackTitle: track.title,
          videoId,
        } satisfies TrackSearchResult;
      }
      catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown ffmpeg error';

        return {
          artist,
          downloadedFilePath: downloadResult.filePath,
          downloadOutput: downloadResult.output,
          ffmpegError: message,
          query,
          results,
          trackId: track['MusicBrainz Release Track Id'],
          trackTitle: track.title,
          videoId,
        } satisfies TrackSearchResult;
      }
    }),
  );

  return NextResponse.json<ReleaseSearchResponse>({
    release,
    trackSearches,
  });
};
