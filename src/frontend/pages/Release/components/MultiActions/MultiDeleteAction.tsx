import { useDeleteLibraryTrack } from 'frontend/services/api/mutations/library';
import { Button } from 'frontend/ui/Button';
import { Dialog } from 'frontend/ui/Dialog';
import { TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { useSelectedTracksStore } from './useSelectedTracksStore';

export const MultiDeleteAction = () => {
  const { resetSelection, tracks } = useSelectedTracksStore();
  const { isPending, mutateAsync: deleteTrack } = useDeleteLibraryTrack();
  const [open, setOpen] = useState(false);

  if (!tracks.every(track => 'id' in track))
    return null;

  return (
    <>
      <Button
        isLoading={isPending}
        onClick={() => setOpen(true)}
        size="xs"
        title="Delete tracks"
        variant="tertiary"
      >
        <TrashIcon />
        Delete Tracks
      </Button>
      <Dialog className="gap-8 md:max-w-200" open={open} setOpen={setOpen}>
        <p className="md:text-xl">
          Selected tracks are going to be removed from your library. This cannot be undone but it is
          possible to add them back later. Are you sure?
        </p>
        <Button
          className="bg-red-500"
          isLoading={isPending}
          onClick={() => {
            tracks.forEach(async (track) => {
              deleteTrack({ releaseId: track.releaseId, trackId: track.id });
            });
            resetSelection();
            setOpen(false);
          }}
        >
          Delete Tracks
        </Button>
      </Dialog>
    </>
  );
};
