export type LibraryReleaseRecord = {
  album: string;
  albumArtist: string;
  completedAt: string;
  coverPath?: string;
  downloadPath: string;
  releaseId: string;
  trackCount: number;
};

export type LibraryReleasesResponse = {
  libraryReleases: LibraryReleaseRecord[];
};

export type LibraryReleaseResponse = {
  libraryRelease: LibraryReleaseRecord;
};

export type ScanLibraryReleasesResponse = {
  libraryReleases: LibraryReleaseRecord[];
};
