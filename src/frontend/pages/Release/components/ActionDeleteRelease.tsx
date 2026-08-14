import type { ReleasePageParams } from '../type';
import { useDeleteLibraryRelease } from 'frontend/services/api/mutations/library';
import { Button } from 'frontend/ui/Button';
import { Dialog } from 'frontend/ui/Dialog';
import { TrashIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

type ActionDeleteReleaseProps = {
  title: string;
};

export const ActionDeleteRelease = ({ title }: ActionDeleteReleaseProps) => {
  const { releaseId } = useParams<ReleasePageParams>();
  const { isPending, mutate: deleteRelease } = useDeleteLibraryRelease();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        isLoading={isPending}
        onClick={() => setOpen(true)}
        size="xs"
        title="Delete Release"
        variant="tertiary"
      >
        <TrashIcon />
        Delete Release
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
          Delete Release
        </Button>
      </Dialog>
    </>
  );
};
