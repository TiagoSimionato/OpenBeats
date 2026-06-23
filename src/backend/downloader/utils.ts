import type { ReleaseResponse, ReleaseTrack } from 'services/mbApi/types';
import type { Track } from './types';

export const sanitize = (s: string) =>
  s
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[<>:"/\\|?*-]/g, '')
    .replace(/\.+$/g, '');

export const padTrack = (n: number) => String(n ?? 0).padStart(2, '0');

export const getArtistLabel = (
  artistCredits: ReleaseResponse['artist-credit'] | ReleaseTrack['artist-credit'] | undefined,
) => {
  const credits = artistCredits ?? [];

  if (credits.length === 0) {
    return 'Unknown artist';
  }

  return credits
    .map(
      credit => `${credit.name ?? credit.artist?.name ?? 'Unknown'}`,
    )
    .join('; ');
};

export const getArtistSortLabel = (
  artistCredits: ReleaseResponse['artist-credit'] | ReleaseTrack['artist-credit'] | undefined,
) => {
  const credits = artistCredits ?? [];

  if (credits.length === 0) {
    return 'Unknown artist';
  }

  return credits
    .map(
      credit => `${credit.artist?.['sort-name'] ?? credit.artist?.name ?? 'Unknown'}${credit.joinphrase ?? ''}`,
    )
    .join('');
};

export const getTrackTitle = (track: ReleaseTrack) => track.title ?? track.recording?.title ?? 'Untitled track';

const getTrackId = (track: ReleaseTrack) =>
  track.id ?? track.recording?.id ?? `${track.position ?? track.number ?? getTrackTitle(track)}`;

export const mapReleaseTracksToDownloadTracks = (release: ReleaseResponse): Track[] => {
  const releaseArtistCredits = release['artist-credit'];
  const releaseGroup = release['release-group'];
  const firstLabel = release['label-info']?.[0]?.label?.name ?? '';

  return release.media?.flatMap((media, mediaIndex) => {
    const disc = media.position ?? mediaIndex + 1;
    const discTotal = release.media?.length ?? 0;

    return media.tracks?.map((track) => {
      const trackArtistCredits = track['artist-credit'] ?? track.recording?.['artist-credit'] ?? releaseArtistCredits;
      const artistLabel = getArtistLabel(trackArtistCredits);
      const artistSortLabel = getArtistSortLabel(trackArtistCredits);
      const title = getTrackTitle(track);
      const trackId = getTrackId(track);
      const musicBrainzArtistId = trackArtistCredits?.[0]?.artist?.id ?? releaseArtistCredits?.[0]?.artist?.id ?? '';

      const recordingTags = track.recording?.tags ?? [];
      const topGenres = (recordingTags ?? [])
        .filter(tag => (tag.count ?? 0) >= 3 && tag.name)
        .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
        .slice(0, 3)
        .map(t => t.name!)
        .filter(Boolean);

      return {
        'album': release.title ?? '',
        'album_artist': getArtistLabel(releaseArtistCredits),
        'artist': artistLabel,
        'artist-sort': artistSortLabel,
        'date': release.date ?? '',
        'disc': disc,
        'Disctotal': discTotal,
        'genre': topGenres,
        'MusicBrainz Album Artist Id': releaseArtistCredits?.[0]?.artist?.id ?? '',
        'MusicBrainz Album Id': release.id,
        'MusicBrainz Album Release Country': release.country ?? '',
        'MusicBrainz Album Status': release.status ?? '',
        'MusicBrainz Album Type': releaseGroup?.['primary-type'] ?? '',
        'MusicBrainz Artist Id': musicBrainzArtistId,
        'MusicBrainz Release Group Id': releaseGroup?.id ?? '',
        'MusicBrainz Release Track Id': trackId,
        'MusicBrainz Track Id': track.recording?.id ?? '',
        'originalyear': Number.parseInt((release.date ?? '').slice(0, 4), 10) || 0,
        'publisher': firstLabel,
        'TDOR': release.date ?? '',
        'title': title,
        'TMED': media.format ?? '',
        'track': track.position ?? 0,
        'Tracktotal': media['track-count'] ?? 0,
        'TSO2': artistSortLabel,
      } satisfies Track;
    }) ?? [];
  }) ?? [];
};
