import type { ReleasePageParams } from '../type';
import { useAddReleaseCover } from 'frontend/services/api/mutations/library';
import { Button } from 'frontend/ui/Button';
import { ImageDownIcon } from 'lucide-react';
import { useParams } from 'next/navigation';

export const ActionAddReleaseCover = () => {
  const { releaseId } = useParams<ReleasePageParams>();
  const { isPending, mutate: addReleaseCover } = useAddReleaseCover();

  return (
    <Button
      isLoading={isPending}
      onClick={() => addReleaseCover(releaseId)}
      size="xs"
      title="Add Cover"
      variant="tertiary"
    >
      <ImageDownIcon />
    </Button>
  );
};
