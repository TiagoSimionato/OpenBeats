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
    label: 'Release Date',
    value: release.releaseDate,
  },
  {
    label: 'Original Year',
    value: release.originalYear,
  },
  {
    label: 'Genres',
    value: [...(new Set(release.tracks.flatMap(it => it.genre?.split('; '))))].join('; '),
  },
  {
    label: 'Album Status',
    value: release.musicBrainzAlbumStatus,
  },
  {
    label: 'Publisher',
    value: release.publisher,
  },
  {
    label: 'Release Country',
    value: release.musicBrainzAlbumReleaseCountry,
  },
  {
    label: 'Release Type',
    value: release.releaseType,
  },
  {
    label: 'Tracks',
    value: release.trackCount,
  },
  {
    label: 'Discs',
    value: release.discTotal,
  },
  {
    label: 'HasCover',
    value: String(!!release.coverPath),
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
    label: 'Artist Id',
    value: release.musicBrainzArtistId,
  },
  {
    label: 'Release Group Id',
    value: release.musicBrainzReleaseGroupId,
  },
  {
    label: 'TMED',
    value: release.tmed,
  },
];
