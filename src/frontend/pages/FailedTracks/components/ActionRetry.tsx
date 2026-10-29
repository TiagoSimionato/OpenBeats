import type { FailedTrack } from 'common/types/requests/failedTracks';
import { useQueueContext } from 'frontend/contexts/QueueContext';
import { useAddRelease, useAddTrack } from 'frontend/services/api/mutations/library';
import { Button } from 'frontend/ui/Button';

type ActionRetryProps = FailedTrack;

export const ActionRetry = ({ releaseId, title, trackId }: ActionRetryProps) => {
  const { enqueueJob, queue } = useQueueContext();
  const { mutateAsync: addTrack } = useAddTrack();
  const { mutateAsync: addRelease } = useAddRelease();

  return (
    <Button
      disabled={queue.some(item => item.id === releaseId || item.id === trackId)}
      onClick={() => {
        if (releaseId === trackId) {
          enqueueJob({
            id: releaseId,
            onStart: () => addRelease(releaseId),
            title: title ?? '',
            totalTracks: 0,
          });
        }
        return enqueueJob({
          id: trackId,
          onStart: () =>
            addTrack({
              releaseId,
              trackId,
            }),
          title: title ?? '',
          totalTracks: 1,
        });
      }}
      size="lg"
      variant="secondary"
    >
      Retry
    </Button>
  );
};
