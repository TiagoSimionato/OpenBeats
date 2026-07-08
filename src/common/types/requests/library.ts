export type TrackRecord = {
  completedAt: string;
  downloadPath: string;
  genre: string;
  id: string;
  musicBrainzReleaseTrackId: string;
  musicBrainzTrackId: string;
  releaseId: string;
  title: string;
  trackNumber: number;
};

export type ReleaseRecord = {
  album: string;
  albumArtist: string;
  artist?: string;
  artistSort?: string;
  completedAt: string;
  coverPath?: string;
  disc: number;
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
  ts02?: string;
};

export type LibraryReleaseData = ReleaseRecord & {
  tracks: TrackRecord[];
};

export type LibraryReleasesResponse = {
  libraryReleases: LibraryReleaseData[];
};

export type LibraryReleaseResponse = {
  libraryRelease: LibraryReleaseData;
};

export type ScanLibraryReleasesResponse = {
  libraryReleases: LibraryReleaseData[];
};
