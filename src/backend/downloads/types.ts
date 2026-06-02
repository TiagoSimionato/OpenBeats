export type DownloadedReleaseRecord = {
  album: string;
  albumArtist: string;
  completedAt: string;
  coverPath?: string;
  downloadPath: string;
  releaseId: string;
  trackCount: number;
};

export type DownloadedReleasesResponse = {
  downloadedReleases: DownloadedReleaseRecord[];
};

export type DownloadedReleaseResponse = {
  downloadedRelease: DownloadedReleaseRecord;
};

export type ScanDownloadedReleasesResponse = {
  downloadedReleases: DownloadedReleaseRecord[];
};
