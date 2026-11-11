import { Button } from 'frontend/ui/Button';
import { RotateCcwIcon } from 'lucide-react';
import { useFailedTracksStore } from './useFailedTracksStore';
import { useRetryFailedTrack } from './useRetryFailedTrack';

export const ActionRetryFailedTracksSelection = () => {
  const { failedTracks, resetSelection } = useFailedTracksStore();
  const { retryFailedTrack } = useRetryFailedTrack();

  return (
    <Button
      onClick={() => {
        failedTracks.forEach((failedTrack) => {
          retryFailedTrack(failedTrack);
        });
        resetSelection();
      }}
      size="xs"
      title="Add Tracks to Library"
      variant="tertiary"
    >
      <RotateCcwIcon size={20} />
      Retry Selected tracks
    </Button>
  );
};
