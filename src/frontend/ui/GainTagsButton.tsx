'use client';

import { useAddGainTags } from 'frontend/services/api/mutations/scanLibrary';
import { Button } from './Button';

export const GainTagsButton = () => {
  const { isPending, mutateAsync: addGainTags } = useAddGainTags();

  return (
    <Button
      className="min-w-34 transition-colors"
      isLoading={isPending}
      onClick={() => addGainTags()}
      variant="secondary"
    >
      Add gain tags
    </Button>
  );
};
