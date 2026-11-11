import { SelectionBar } from 'frontend/ui/SelectionBar';
import { ActionAddTrackSelection } from './ActionAddTrackSelection';
import { ActionDeleteTrackSelection } from './ActionDeleteTrackSelection';
import { useSelectedTracksStore } from './useSelectedTracksStore';

export const TrackSelection = () => {
  const { resetSelection, tracks } = useSelectedTracksStore();

  return (
    <SelectionBar
      onClear={resetSelection}
      open={tracks.length > 0}
      title={`${tracks.length} items selected`}
    >
      <ActionAddTrackSelection />
      <ActionDeleteTrackSelection />
    </SelectionBar>
  );
};
