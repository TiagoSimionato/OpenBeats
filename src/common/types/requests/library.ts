import type { Paged } from './paged';

export type TrackRequestParams = {
  releaseId: string;
  trackId: string;
  url?: string;
};

export type ImportTrackRequest = {
  formData: FormData;
  releaseId: string;
  trackId: string;
};

export type ImportCoverRequest = { formData: FormData; releaseId: string };

export type TrackRecord = {
  artist?: null | string;
  artistSort?: null | string;
  disc: number;
  downloadPath: string;
  genre?: null | string;
  id: string;
  musicBrainzReleaseTrackId: string;
  musicBrainzTrackId: string;
  releaseId: string;
  title: string;
  trackNumber: number;
  ts02?: null | string;

};

export type ReleaseRecord = {
  album: string;
  albumArtist: string;
  coverPath?: null | string;
  discTotal: number;
  id: string;
  musicBrainzAlbumArtistId: string;
  musicBrainzAlbumId: string;
  musicBrainzAlbumReleaseCountry?: null | string;
  musicBrainzAlbumStatus?: null | string;
  musicBrainzArtistId: string;
  musicBrainzReleaseGroupId: string;
  originalYear?: null | number;
  publisher?: null | string;
  releaseDate?: null | string;
  releaseType: string;
  tmed?: null | string;
  trackCount: number;
};

export type LibraryReleaseData = ReleaseRecord & {
  tracks: TrackRecord[];
};

export type LibraryReleasesResponse = Paged<LibraryReleaseData>;

export type LibraryReleaseResponse = {
  libraryRelease: LibraryReleaseData;
};
