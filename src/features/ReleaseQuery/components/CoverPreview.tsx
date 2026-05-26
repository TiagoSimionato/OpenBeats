'use client';

import { useCover } from 'services/caaApi/queries/covers';

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
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border border-zinc-200 bg-zinc-100 text-xs text-zinc-500">
        No cover
      </div>
    );
  }

  return (
    <img
      alt={title ? `${title} cover art` : 'release cover art'}
      className="h-16 w-16 shrink-0 rounded object-cover"
      height={64}
      src={coverUrl}
      width={64}
    />
  );
};
