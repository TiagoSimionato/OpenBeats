import type { ButtonProps } from 'frontend/ui/Button';
import { useQueueContext } from 'frontend/contexts/QueueContext';
import { useGetFailedTracks } from 'frontend/services/api/queries/failedTracks';
import { Button } from 'frontend/ui/Button';
import { RefreshCcwIcon } from 'lucide-react';
import { useRetryFailedTrack } from './useRetryFailedTrack';

type ActionRetryAllProps = ButtonProps;

export const ActionRetryAll = ({ className, ...props }: ActionRetryAllProps) => {
  const { queue } = useQueueContext();
  const { data: failedTracks } = useGetFailedTracks();
  const { retryFailedTrack } = useRetryFailedTrack();

  return (
    <Button
      className={`gap-2 ${className}`}
      disabled={queue.length > 0}
      onClick={() => failedTracks?.forEach(failedTrack => retryFailedTrack(failedTrack))}
      size="lg"
      variant="secondary"
      {...props}
    >
      <RefreshCcwIcon />
      Retry All Failed Tracks
    </Button>
  );
};
