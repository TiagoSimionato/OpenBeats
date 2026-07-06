export type Track = {
  'album': string;
  'album_artist': string;
  'artist': string;
  'artist-sort': string;
  'coverPath'?: string;
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
  'trackPath'?: string;
  'Tracktotal': number;
  'TSO2': string;
};

export type TrackSearchResult = {
  coverFilePath?: string;
  downloadedFilePath: string;
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
  currentTrack: number;
  currentTrackTitle?: string;
  error?: string;
  jobId: string;
  message?: string;
  stage: DownloadJobStage;
  status: DownloadJobStatus;
};

export type StartDownloadResponse = {
  jobId: string;
};
