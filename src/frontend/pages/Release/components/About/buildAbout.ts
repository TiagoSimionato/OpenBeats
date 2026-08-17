import type { LibraryReleaseData } from 'common/types/requests/library';

export const buildAbout = (release: LibraryReleaseData) => [
  {
    label: 'Album',
    value: release.album,
  },
  {
    label: 'Album Artist',
    value: release.albumArtist,
  },
  {
    label: 'Cover Path',
    value: release.coverPath,
  },
  {
    label: 'Discs',
    value: release.discTotal,
  },
  {
    label: 'Id',
    value: release.id,
  },
  {
    label: 'Album artist id',
    value: release.musicBrainzAlbumArtistId,
  },
  {
    label: 'Album id',
    value: release.musicBrainzAlbumId,
  },
  {
    label: 'Release Country',
    value: release.musicBrainzAlbumReleaseCountry,
  },
  {
    label: 'Album Status',
    value: release.musicBrainzAlbumStatus,
  },
  {
    label: 'Artist Id',
    value: release.musicBrainzArtistId,
  },
  {
    label: 'Release Group Id',
    value: release.musicBrainzReleaseGroupId,
  },
  {
    label: 'Original Year',
    value: release.originalYear,
  },
  {
    label: 'Publisher',
    value: release.publisher,
  },
  {
    label: 'Release Date',
    value: release.releaseDate,
  },
  {
    label: 'Release Type',
    value: release.releaseType,
  },
  {
    label: 'Genres',
    value: [...(new Set(release.tracks.flatMap(it => it.genre.split('; '))))].slice(0, -1).join('; '),
  },
  {
    label: 'TMED',
    value: release.tmed,
  },
  {
    label: 'Tracks',
    value: release.trackCount,
  },
];
