import type { FailedTrack } from 'common/types/requests/failedTracks';
import { useQueueContext } from 'frontend/contexts/QueueContext';
import { Button } from 'frontend/ui/Button';
import { useRetryFailedTrack } from './useRetryFailedTrack';

type ActionRetryProps = FailedTrack;

export const ActionRetry = (failedTrack: ActionRetryProps) => {
  const { queue } = useQueueContext();
  const { retryFailedTrack } = useRetryFailedTrack();

  return (
    <Button
      disabled={queue.some(
        item => item.id === failedTrack.releaseId || item.id === failedTrack.trackId,
      )}
      onClick={() => {
        retryFailedTrack(failedTrack);
      }}
      size="lg"
      variant="secondary"
    >
      Retry
    </Button>
  );
};
