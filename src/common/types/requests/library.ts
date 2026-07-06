export type TrackRecord = {
  completedAt: string;
  downloadPath: string;
  id: string;
  releaseId: string;
  title: string;
  trackNumber: number;
};

export type ReleaseRecord = {
  album: string;
  albumArtist: string;
  completedAt: string;
  coverPath?: string;
  id: string;
  trackCount: number;
};

export type LibraryReleaseData = {
  album: string;
  albumArtist: string;
  completedAt: string;
  coverPath?: string;
  id: string;
  trackCount: number;
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
