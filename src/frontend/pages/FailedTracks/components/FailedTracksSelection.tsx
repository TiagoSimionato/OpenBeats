import { SelectionBar } from 'frontend/ui/SelectionBar';
import { ActionRetryFailedTracksSelection } from './ActionRetryFailedTracksSelection';
import { useFailedTracksStore } from './useFailedTracksStore';

export const FailedTracksSelection = () => {
  const { failedTracks, resetSelection } = useFailedTracksStore();

  return (
    <SelectionBar
      onClear={resetSelection}
      open={failedTracks.length > 0}
      title={`${failedTracks.length} items selected`}
    >
      <ActionRetryFailedTracksSelection />
    </SelectionBar>
  );
};
