import type { TrackActions } from './types';
import { useQueueContext } from 'frontend/contexts/QueueContext';
import { useAddTrack } from 'frontend/services/api/mutations/library';
import { Button } from 'frontend/ui/Button';
import { DownloadIcon } from 'lucide-react';

export const ActionAddTrack = ({ releaseId, title, trackId }: TrackActions) => {
  const { mutateAsync: addTrack } = useAddTrack();
  const { enqueueJob } = useQueueContext();

  return (
    <Button
      onClick={() =>
        enqueueJob({
          id: trackId,
          onStart: () =>
            addTrack({
              releaseId,
              trackId,
            }),
          title,
          totalTracks: 1,
        })}
      size="xs"
      variant="tertiary"
    >
      <DownloadIcon />
    </Button>
  );
};
