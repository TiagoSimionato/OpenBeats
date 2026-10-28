export type FailedTrack = {
  artist: string;
  reason: string;
  releaseId: string;
  title: string;
  trackId: string;
};

export type FailedTracksResponse = FailedTrack[];

export type FailedTracksAmountResponse = { amount: number };
