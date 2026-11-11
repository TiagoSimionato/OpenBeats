import type { FailedTrack } from 'common/types/requests/failedTracks';
import { useQueueContext } from 'frontend/contexts/QueueContext';
import { useAddRelease, useAddTrack } from 'frontend/services/api/mutations/library';

export const useRetryFailedTrack = () => {
  const { enqueueJob } = useQueueContext();
  const { mutateAsync: addTrack } = useAddTrack();
  const { mutateAsync: addRelease } = useAddRelease();

  const retryFailedTrack = ({ releaseId, title, trackId }: FailedTrack) => {
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
  };

  return { retryFailedTrack };
};
