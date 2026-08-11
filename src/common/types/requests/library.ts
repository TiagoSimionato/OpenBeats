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
  artist?: string;
  artistSort?: string;
  disc: number;
  downloadPath: string;
  genre: string;
  id: string;
  musicBrainzReleaseTrackId: string;
  musicBrainzTrackId: string;
  releaseId: string;
  title: string;
  trackNumber: number;
  ts02?: string;

};

export type ReleaseRecord = {
  album: string;
  albumArtist: string;
  coverPath?: string;
  discTotal: number;
  id: string;
  musicBrainzAlbumArtistId: string;
  musicBrainzAlbumId: string;
  musicBrainzAlbumReleaseCountry?: string;
  musicBrainzAlbumStatus?: string;
  musicBrainzArtistId: string;
  musicBrainzReleaseGroupId: string;
  originalYear?: number;
  publisher?: string;
  releaseDate?: string;
  releaseType: string;
  tmed?: string;
  trackCount: number;
};

export type LibraryReleaseData = ReleaseRecord & {
  tracks: TrackRecord[];
};

export type LibraryReleasesResponse = Paged<LibraryReleaseData>;

export type LibraryReleaseResponse = {
  libraryRelease: LibraryReleaseData;
};
