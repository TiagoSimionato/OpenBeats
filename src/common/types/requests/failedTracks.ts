export type FailedTrack = {
  artist?: null | string;
  reason: string;
  releaseId: string;
  title?: null | string;
  trackId: string;
};

export type FailedTracksResponse = FailedTrack[];

export type FailedTracksAmountResponse = { amount: number };
