'use client';

import { useCover } from 'frontend/services/caaApi/queries/covers';
import Image from 'next/image';

export const CoverPreview = ({
  releaseId,
  title,
}: Readonly<{
  releaseId: string;
  title?: string;
}>) => {
  const { data } = useCover({
    options: {
      retry: false,
    },
    releaseId,
  });

  const firstImage
    = data?.images?.find(image => image.front) ?? data?.images?.[0];
  const coverUrl
    = firstImage?.thumbnails?.small
      ?? firstImage?.thumbnails?.[250]
      ?? firstImage?.image;

  if (!coverUrl) {
    return (
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded border border-zinc-200 bg-zinc-100 text-xs text-zinc-500">
        No cover
      </div>
    );
  }

  return (
    <Image
      alt={title ? `${title} cover art` : 'release cover art'}
      className="h-24 w-24 shrink-0 rounded object-cover"
      height={500}
      src={coverUrl}
      width={500}
    />
  );
};
