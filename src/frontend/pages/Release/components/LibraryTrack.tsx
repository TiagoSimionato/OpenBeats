import type { TrackRecord } from 'common/types/requests/library';
import { useDeleteLibraryTrack } from 'frontend/services/api/mutations/library';
import { Button } from 'frontend/ui/Button';
import { FileMusicIcon, TrashIcon } from 'lucide-react';

type LibraryTrackProps = {
  track: TrackRecord;
};

export const LibraryTrack = ({ track }: LibraryTrackProps) => {
  const { isPending, mutate: deleteTrack } = useDeleteLibraryTrack();

  return (
    <div className="flex justify-end gap-4">
      <p className="mr-auto">
        {track?.trackNumber}
        {'. '}
        {track?.title}
      </p>
      <Button size="xs" variant="tertiary">
        <FileMusicIcon />
      </Button>
      <Button
        isLoading={isPending}
        onClick={() => deleteTrack({ releaseId: track.releaseId, trackId: track.id })}
        size="xs"
        variant="tertiary"
      >
        <TrashIcon />
      </Button>
    </div>
  );
};
