import type { TrackActions } from './types';
import { useDeleteLibraryTrack } from 'frontend/services/api/mutations/library';
import { Button } from 'frontend/ui/Button';
import { Dialog } from 'frontend/ui/Dialog';
import { TrashIcon } from 'lucide-react';
import { useState } from 'react';

export const ActionDeleteTrack = ({ releaseId, title, trackId }: TrackActions) => {
  const { isPending, mutate: deleteTrack } = useDeleteLibraryTrack();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button isLoading={isPending} onClick={() => setOpen(true)} size="xs" variant="tertiary">
        <TrashIcon />
      </Button>
      <Dialog className="gap-8 md:max-w-200" open={open} setOpen={setOpen}>
        <p className="md:text-xl">
          <span className="text-primary font-bold">{title}</span>
          {' '}
          is going to be removed from your
          library. Are you sure?
        </p>
        <Button
          className="bg-red-500"
          isLoading={isPending}
          onClick={() => {
            deleteTrack({ releaseId, trackId });
            setOpen(false);
          }}
        >
          Delete Track
        </Button>
      </Dialog>
    </>
  );
};
