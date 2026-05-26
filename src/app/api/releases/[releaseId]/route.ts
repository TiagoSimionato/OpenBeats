import type { ReleaseResponse } from 'services/mbApi/types';
import { getArtistLabel, getTrackId, getTrackTitle } from 'features/downloader/utils';
import { buildTrackQuery, downloadTrackAudio, searchYouTubeMusic } from 'features/downloader/youtube';
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

type TrackSearchResult = {
  artist: string;
  downloadOutput?: string;
  query: string;
  results: unknown[];
  trackId: string;
  trackTitle: string;
  videoId?: string;
  ytdlpError?: string;
  ytmusicError?: string;
};

type ReleaseSearchResponse = {
  release: ReleaseResponse;
  trackSearches: TrackSearchResult[];
};

export const GET = async (_request: Request, { params }: RouteContext) => {
  const { releaseId } = await params;
  const release = await mbApi.get<ReleaseResponse>(`release/${releaseId}`, {
    params: {
      inc: MUSICBRAINZ_RELEASE_INC,
    },
  });
  const tracks = release.media?.flatMap(media => media.tracks ?? []) ?? [];

  const trackSearches = await Promise.all(
    tracks.map(async (track) => {
      const query = buildTrackQuery(track, release);
      const artist = getArtistLabel(
        track['artist-credit'] ?? track.recording?.['artist-credit'] ?? release['artist-credit'],
      );

      try {
        const results = await searchYouTubeMusic(query);
        const videoId = results[0]?.videoId;

        if (!videoId) {
          throw new Error('No YTMusic videoId found');
        }

        const downloadOutput = await downloadTrackAudio({
          videoId,
        });

        return {
          artist,
          downloadOutput,
          query,
          results,
          trackId: getTrackId(track),
          trackTitle: getTrackTitle(track),
          videoId,
        } satisfies TrackSearchResult;
      }
      catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown YTMusic search error';

        return {
          artist,
          query,
          results: [],
          trackId: getTrackId(track),
          trackTitle: getTrackTitle(track),
          videoId: undefined,
          ytmusicError: message,
        } satisfies TrackSearchResult;
      }
    }),
  );

  return NextResponse.json<ReleaseSearchResponse>({
    release,
    trackSearches,
  });
};
