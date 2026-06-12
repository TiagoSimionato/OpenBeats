import type { ReleaseResponse } from 'services/mbApi/types';

export type Track = {
  'album': string;
  'album_artist': string;
  'artist': string;
  'artist-sort': string;
  'date': string;
  'disc': number;
  'Disctotal': number;
  'genre': string[];
  'MusicBrainz Album Artist Id': string;
  'MusicBrainz Album Id': string;
  'MusicBrainz Album Release Country': string;
  'MusicBrainz Album Status': string;
  'MusicBrainz Album Type': string;
  'MusicBrainz Artist Id': string;
  'MusicBrainz Release Group Id': string;
  'MusicBrainz Release Track Id': string;
  'MusicBrainz Track Id': string;
  'originalyear': number;
  'publisher': string;
  'TDOR': string;
  'title': string;
  'TMED': string;
  'track': number;
  'Tracktotal': number;
  'TSO2': string;
};

export type TrackSearchResult = {
  artist: string;
  coverError?: string;
  coverFilePath?: string;
  downloadedFilePath?: string;
  downloadOutput?: string;
  ffmpegError?: string;
  ffmpegOutput?: string;
  query: string;
  results: unknown[];
  trackId: string;
  trackTitle: string;
  videoId: string;
  ytdlpError?: string;
  ytmusicError?: string;
};

export type ReleaseSearchResponse = {
  release: ReleaseResponse;
  trackSearches: TrackSearchResult[];
};

export type DownloadJobStage
  = | 'completed'
    | 'cover'
    | 'download'
    | 'failed'
    | 'metadata'
    | 'queued'
    | 'search';

export type DownloadJobStatus = 'completed' | 'failed' | 'running';

export type DownloadJobProgress = {
  currentTrackTitle?: string;
  error?: string;
  jobId: string;
  message?: string;
  processedTracks: number;
  stage: DownloadJobStage;
  status: DownloadJobStatus;
  totalTracks: number;
};

export type StartDownloadResponse = {
  jobId: string;
};
