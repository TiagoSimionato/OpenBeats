import type { ButtonProps } from 'frontend/ui/Button';
import { useQueueContext } from 'frontend/contexts/QueueContext';
import { useGetFailedTracks } from 'frontend/services/api/queries/failedTracks';
import { Button } from 'frontend/ui/Button';
import { useRetryFailedTrack } from './useRetryFailedTrack';

type ActionRetryAllProps = ButtonProps;

export const ActionRetryAll = (props: ActionRetryAllProps) => {
  const { queue } = useQueueContext();
  const { data: failedTracks } = useGetFailedTracks();
  const { retryFailedTrack } = useRetryFailedTrack();

  return (
    <Button
      disabled={queue.length > 0}
      onClick={() => failedTracks?.forEach(failedTrack => retryFailedTrack(failedTrack))}
      variant="secondary"
      {...props}
    >
      Retry All Failed Tracks
    </Button>
  );
};
