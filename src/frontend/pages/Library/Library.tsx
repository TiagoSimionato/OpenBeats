'use client';

import type { LibraryReleaseData } from 'common/types/requests/library';
import { useGetLibrary } from 'frontend/services/api/queries/library';
import { PaginationControls } from 'frontend/ui/PaginationControls';
import { useEffect, useRef } from 'react';
import { LibraryFilters } from './components/LibraryFilters';
import { NoReleasesFound } from './components/NoReleasesFound';
import { ReleaseCard } from './components/ReleaseCard';
import { useGridWidthStore } from './store/useGridWidthStore';

type LibraryListingProps = {
  defaultPages: number;
  defaultReleases: LibraryReleaseData[];
};

export const LibraryPage = ({ defaultPages, defaultReleases }: LibraryListingProps) => {
  const { data: libraryData } = useGetLibrary();
  const { setWidth, width } = useGridWidthStore();
  const gridRef = useRef<HTMLDivElement>(null);

  const releases = libraryData?.data ?? defaultReleases;

  useEffect(() => {
    if (gridRef.current?.clientWidth)
      setWidth(gridRef.current.clientWidth);
  }, [setWidth]);

  const colSize = 200;
  const cardPadding = 16;
  const isSingleLine = width && releases.length * (colSize + cardPadding) < width;

  return (
    <main className="flex grow flex-col gap-4">
      <LibraryFilters />
      {releases.length === 0 && <NoReleasesFound />}
      {releases.length > 0 && (
        <div
          className="flex flex-wrap sm:grid"
          ref={gridRef}
          style={{
            gridTemplateColumns: isSingleLine
              ? `repeat(auto-fit, ${colSize + cardPadding}px)`
              : `repeat(auto-fit, minmax(${colSize}px, 1fr))`,
          }}
        >
          {width && releases.map(release => <ReleaseCard key={release.id} release={release} />)}
        </div>
      )}
      <PaginationControls
        className={releases.length === 0 ? 'hidden' : ''}
        pages={libraryData?.pages ?? defaultPages}
      />
    </main>
  );
};
