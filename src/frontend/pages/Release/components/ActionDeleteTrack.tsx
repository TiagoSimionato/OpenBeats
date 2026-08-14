import type { ReleasePageParams } from '../type';
import type { TrackActions } from './types';
import { useDeleteLibraryTrack } from 'frontend/services/api/mutations/library';
import { Button } from 'frontend/ui/Button';
import { Dialog } from 'frontend/ui/Dialog';
import { TrashIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export const ActionDeleteTrack = ({ title, trackId }: TrackActions) => {
  const { releaseId } = useParams<ReleasePageParams>();
  const { isPending, mutate: deleteTrack } = useDeleteLibraryTrack();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        isLoading={isPending}
        onClick={() => setOpen(true)}
        size="xs"
        title="Delete track"
        variant="tertiary"
      >
        <TrashIcon />
        Delete track
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
