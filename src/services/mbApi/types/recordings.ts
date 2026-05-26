export type QueryReleaseResponse = {
  count: number;
  created?: string;
  offset?: number;
  releases: QueryRelease[];
};

export type QueryRelease = {
  "artist-credit": ArtistCredit[];
  "artist-credit-id"?: string;
  asin?: string;
  barcode?: string;
  count?: number;
  country?: string | null;
  date?: string;
  disambiguation?: string;
  id: string;
  "label-info"?: LabelInfo[];
  media?: Media[];
  packaging?: string | null;
  "packaging-id"?: string | null;
  "release-events"?: ReleaseEvent[];
  "release-group"?: ReleaseGroup;
  score?: number;
  status?: string;
  "status-id"?: string | null;
  "text-representation"?: TextRepresentation;
  title?: string;
  "track-count"?: number;
  tags?: Tag[];
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

export type RecordingsResponse = {
  "artist-credit": ArtistCredit[];
  disambiguation?: string;
  "first-release-date"?: string | null;
  id: string;
  length?: number;
  releases?: Release[];
  title?: string;
  video?: boolean;
};

export type ArtistCredit = {
  artist: Artist;
  joinphrase?: string;
  name?: string;
};

export type Artist = {
  country?: string | null;
  disambiguation?: string;
  id: string;
  name: string;
  "sort-name"?: string;
  type?: string;
  "type-id"?: string | null;
};

export type Release = {
  "artist-credit": ArtistCredit[];
  barcode?: string | null;
  country?: string | null;
  date?: string;
  disambiguation?: string;
  id: string;
  media?: Media[];
  packaging?: string | null;
  "packaging-id"?: string | null;
  quality?: string;
  "release-events"?: ReleaseEvent[];
  "release-group"?: ReleaseGroup;
  status?: string;
  "status-id"?: string | null;
  "text-representation"?: TextRepresentation;
  title?: string;
};

export type Media = {
  format?: string;
  "format-id"?: string | null;
  id?: string;
  position?: number;
  title?: string;
  "track-count"?: number;
  "track-offset"?: number;
  tracks?: Track[];
};

export type Track = {
  id?: string;
  number?: string | number;
  position?: number;
  title?: string;
  length?: number;
  recording?: RecordingReference;
};

export type RecordingReference = {
  id: string;
  title?: string;
  length?: number;
};

export type ReleaseEvent = {
  area?: Area | null;
  date?: string;
};

export type Area = {
  id?: string;
  name?: string;
  "type-id"?: string | null;
};

export type ReleaseGroup = {
  "artist-credit"?: ArtistCredit[];
  disambiguation?: string;
  "first-release-date"?: string | null;
  id?: string;
  "primary-type"?: string;
  "primary-type-id"?: string | null;
  releases?: Release[];
  "secondary-type-ids"?: string[];
  "secondary-types"?: string[];
  title?: string;
};

export type TextRepresentation = {
  language?: string | null;
  script?: string;
};