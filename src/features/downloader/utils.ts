import type { ReleaseResponse, ReleaseTrack } from 'services/mbApi/types';

export const getArtistLabel = (
  artistCredits: ReleaseResponse['artist-credit'] | ReleaseTrack['artist-credit'] | undefined,
) => {
  const credits = artistCredits ?? [];

  if (credits.length === 0) {
    return 'Unknown artist';
  }

  return credits
    .map(
      credit => `${credit.name ?? credit.artist?.name ?? 'Unknown'}${credit.joinphrase ?? ''}`,
    )
    .join('');
};

export const getTrackTitle = (track: ReleaseTrack) => track.title ?? track.recording?.title ?? 'Untitled track';

export const getTrackId = (track: ReleaseTrack) =>
  track.id ?? track.recording?.id ?? `${track.position ?? track.number ?? getTrackTitle(track)}`;
