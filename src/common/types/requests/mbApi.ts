export type QueryReleaseResponse = {
  count: number;
  created?: string;
  offset?: number;
  releases: QueryRelease[];
};

export type ReleaseResponse = {
  'artist-credit'?: ArtistCredit[];
  'asin'?: null | string;
  'barcode'?: null | string;
  'country'?: null | string;
  'cover-art-archive'?: ReleaseCoverArtArchive;
  'date'?: string;
  'disambiguation'?: string;
  'id': string;
  'label-info'?: ReleaseLabelInfo[];
  'media'?: ReleaseMedia[];
  'packaging'?: null | string;
  'packaging-id'?: null | string;
  'quality'?: string;
  'release-events'?: ReleaseEvent[];
  'release-group'?: ReleaseGroup;
  'status'?: string;
  'status-id'?: null | string;
  'text-representation'?: TextRepresentation;
  'title'?: string;
};

export type QueryRelease = {
  'artist-credit': ArtistCredit[];
  'artist-credit-id'?: string;
  'asin'?: string;
  'barcode'?: string;
  'count'?: number;
  'country'?: null | string;
  'date'?: string;
  'disambiguation'?: string;
  'id': string;
  'label-info'?: LabelInfo[];
  'media'?: Media[];
  'packaging'?: null | string;
  'packaging-id'?: null | string;
  'release-events'?: ReleaseEvent[];
  'release-group'?: ReleaseGroup;
  'score'?: number;
  'status'?: string;
  'status-id'?: null | string;
  'tags'?: Tag[];
  'text-representation'?: TextRepresentation;
  'title'?: string;
  'track-count'?: number;
};

export type LabelInfo = {
  catalog_number?: string;
  label?: {
    id?: string;
    name?: string;
  };
};

export type Tag = {
  count?: number;
  name?: string;
};

export type ReleaseCoverArtArchive = {
  artwork?: boolean;
  back?: boolean;
  count?: number;
  darkened?: boolean;
  front?: boolean;
};

export type ReleaseLabelInfo = {
  'catalog-number'?: null | string;
  'label'?: ReleaseLabel;
};

export type ReleaseLabel = {
  'disambiguation'?: string;
  'id'?: string;
  'label-code'?: number;
  'name'?: string;
  'sort-name'?: string;
  'type'?: string;
  'type-id'?: null | string;
};

export type RecordingsResponse = {
  'artist-credit': ArtistCredit[];
  'disambiguation'?: string;
  'first-release-date'?: null | string;
  'id': string;
  'length'?: number;
  'releases'?: Release[];
  'title'?: string;
  'video'?: boolean;
};

export type ArtistCredit = {
  artist: Artist;
  joinphrase?: string;
  name?: string;
};

export type Artist = {
  'country'?: null | string;
  'disambiguation'?: string;
  'id': string;
  'name': string;
  'sort-name'?: string;
  'type'?: string;
  'type-id'?: null | string;
};

export type Release = {
  'artist-credit': ArtistCredit[];
  'barcode'?: null | string;
  'country'?: null | string;
  'date'?: string;
  'disambiguation'?: string;
  'id': string;
  'media'?: Media[];
  'packaging'?: null | string;
  'packaging-id'?: null | string;
  'quality'?: string;
  'release-events'?: ReleaseEvent[];
  'release-group'?: ReleaseGroup;
  'status'?: string;
  'status-id'?: null | string;
  'text-representation'?: TextRepresentation;
  'title'?: string;
};

export type Media = {
  'format'?: string;
  'format-id'?: null | string;
  'id'?: string;
  'position'?: number;
  'title'?: string;
  'track-count'?: number;
  'track-offset'?: number;
  'tracks'?: Track[];
};

export type Track = {
  id?: string;
  length?: number;
  number?: number | string;
  position?: number;
  recording?: RecordingReference;
  title?: string;
};

export type RecordingReference = {
  id: string;
  length?: number;
  title?: string;
};

export type ReleaseMedia = {
  'format'?: string;
  'format-id'?: null | string;
  'id'?: string;
  'position'?: number;
  'title'?: string;
  'track-count'?: number;
  'track-offset'?: number;
  'tracks'?: ReleaseTrack[];
};

export type ReleaseRecording = {
  'artist-credit'?: ArtistCredit[];
  'disambiguation'?: string;
  'first-release-date'?: null | string;
  'id': string;
  'length'?: number;
  'tags'?: Tag[];
  'title'?: string;
  'video'?: boolean;
};

export type ReleaseTrack = {
  'artist-credit'?: ArtistCredit[];
  'id'?: string;
  'length'?: number;
  'number'?: number | string;
  'position'?: number;
  'recording'?: ReleaseRecording;
  'title'?: string;
};

export type ReleaseEvent = {
  area?: Area | null;
  date?: string;
};

export type Area = {
  'id'?: string;
  'name'?: string;
  'type-id'?: null | string;
};

export type ReleaseGroup = {
  'artist-credit'?: ArtistCredit[];
  'disambiguation'?: string;
  'first-release-date'?: null | string;
  'id'?: string;
  'primary-type'?: string;
  'primary-type-id'?: null | string;
  'releases'?: Release[];
  'secondary-type-ids'?: string[];
  'secondary-types'?: string[];
  'title'?: string;
};

export type TextRepresentation = {
  language?: null | string;
  script?: string;
};
