import type { ReleasePageParams } from '../type';
import type { TrackActions } from './types';
import { useQueueContext } from 'frontend/contexts/QueueContext';
import { useAddTrack } from 'frontend/services/api/mutations/library';
import { Button } from 'frontend/ui/Button';
import { DownloadIcon } from 'lucide-react';
import { useParams } from 'next/navigation';

export const ActionAddTrack = ({ title, trackId }: TrackActions) => {
  const { releaseId } = useParams<ReleasePageParams>();
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
      title="Add Track to Library"
      variant="tertiary"
    >
      <DownloadIcon />
      Add track
    </Button>
  );
};
