'use client';

import { useCover } from 'frontend/services/caaApi/queries/covers';
import { CoverImage } from 'frontend/ui/CoverImage';
import { Spinner } from 'frontend/ui/Spinner';

export const CoverPreview = ({ releaseId, title }: { releaseId: string; title?: string }) => {
  const { data, isPending } = useCover({
    options: {
      retry: false,
    },
    releaseId,
  });

  const firstImage = data?.images?.find(image => image.front) ?? data?.images?.[0];
  const coverUrl
    = firstImage?.thumbnails?.small ?? firstImage?.thumbnails?.[250] ?? firstImage?.image;

  if (isPending) {
    return (
      <div className="flex aspect-square w-24 items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return <CoverImage className="rounded" coverURL={coverUrl} releaseName={title ?? ''} size={96} />;
};
