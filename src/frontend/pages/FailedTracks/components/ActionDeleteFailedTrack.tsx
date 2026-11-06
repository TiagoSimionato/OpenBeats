import type { TrackActions } from 'frontend/pages/Release/components/types';
import { useDeleteFailedTrack } from 'frontend/services/api/mutations/failedTracks';
import { Button } from 'frontend/ui/Button';
import { XIcon } from 'lucide-react';

export const ActionDeleteFailedTrack = ({ trackId }: Omit<TrackActions, 'title'>) => {
  const { isPending, mutate: deleteFailedTrack } = useDeleteFailedTrack();

  return (
    <Button
      className="rounded-full p-1 hover:bg-red-500"
      isLoading={isPending}
      onClick={() => deleteFailedTrack(trackId)}
      size="xs"
      variant="tertiary"
    >
      <XIcon />
    </Button>
  );
};
