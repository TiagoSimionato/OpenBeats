'use client';

import { useCover } from 'frontend/services/caaApi/queries/covers';
import { Icon } from 'frontend/ui/Icon';
import { Spinner } from 'frontend/ui/Spinner';
import Image from 'next/image';

export const CoverPreview = ({
  releaseId,
  title,
}: Readonly<{
  releaseId: string;
  title?: string;
}>) => {
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

  if (!coverUrl) {
    return (
      <Icon className="aspect-square w-24 shrink-0 scale-70 rounded object-cover" name="disc" />
    );
  }

  return (
    <Image
      alt={title ? `${title} cover art` : 'release cover art'}
      className="aspect-square w-24 shrink-0 rounded object-cover"
      height={500}
      src={coverUrl}
      width={500}
    />
  );
};
