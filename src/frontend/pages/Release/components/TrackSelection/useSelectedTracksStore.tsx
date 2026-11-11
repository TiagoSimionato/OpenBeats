import type { TrackRecord } from 'common/types/requests/library';
import type { Track } from 'common/types/requests/releases';
import { create } from 'zustand';

type SelectedTracksStore = {
  addTrack: (track: Track | TrackRecord) => void;
  removeTrack: (track: Track | TrackRecord) => void;
  resetSelection: () => void;
  tracks: (Track | TrackRecord)[];
};

export const useSelectedTracksStore = create<SelectedTracksStore>(set => ({
  addTrack: (track: Track | TrackRecord) =>
    set(state => ({
      tracks: [...state.tracks, track],
    })),
  removeTrack: (track: Track | TrackRecord) =>
    set(state => ({
      tracks: state.tracks.filter((it) => {
        if ('id' in it && 'id' in track && it.id === track.id)
          return false;
        if (
          'MusicBrainz Track Id' in it
          && 'MusicBrainz Track Id' in track
          && it['MusicBrainz Track Id'] === track['MusicBrainz Track Id']
        ) {
          return false;
        }
        return true;
      }),
    })),
  resetSelection: () => set({ tracks: [] }),
  tracks: [],
}));
