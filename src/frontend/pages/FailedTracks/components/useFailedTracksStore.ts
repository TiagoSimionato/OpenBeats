import type { FailedTrack } from 'common/types/requests/failedTracks';
import { create } from 'zustand';

type FailedTracksStore = {
  addFailedTrack: (track: FailedTrack) => void;
  failedTracks: (FailedTrack)[];
  removeFailedTrack: (track: FailedTrack) => void;
  resetSelection: () => void;
};

export const useFailedTracksStore = create<FailedTracksStore>(set => ({
  addFailedTrack: (track: FailedTrack) =>
    set(state => ({
      failedTracks: [...state.failedTracks, track],
    })),
  failedTracks: [],
  removeFailedTrack: (track: FailedTrack) =>
    set(state => ({
      failedTracks: state.failedTracks.filter((it) => {
        if (it.trackId === track.trackId && it.releaseId === track.releaseId)
          return false;
        return true;
      }),
    })),
  resetSelection: () => set({ failedTracks: [] }),
}));
