import { useDeleteLibraryRelease } from 'frontend/services/api/mutations/library';
import { Button } from 'frontend/ui/Button';
import { Dialog } from 'frontend/ui/Dialog';
import { TrashIcon } from 'lucide-react';
import { useState } from 'react';

type ActionDeleteReleaseProps = {
  releaseId: string;
  title: string;
};

export const ActionDeleteRelease = ({ releaseId, title }: ActionDeleteReleaseProps) => {
  const { isPending, mutate: deleteRelease } = useDeleteLibraryRelease();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button isLoading={isPending} size="xs" variant="tertiary">
        <TrashIcon onClick={() => setOpen(true)} />
      </Button>
      <Dialog className="gap-8 md:max-w-200" open={open} setOpen={setOpen}>
        <p className="md:text-xl">
          <span className="text-primary font-bold">{title}</span>
          {' '}
          is going to be removed from your
          library. This will remove all tracks and cached images. Are you sure?
        </p>
        <Button
          className="bg-red-500"
          isLoading={isPending}
          onClick={() => {
            deleteRelease(releaseId);
            setOpen(false);
          }}
        >
          Delete Track
        </Button>
      </Dialog>
    </>
  );
};
