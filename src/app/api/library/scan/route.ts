import type { ScanLibraryReleasesResponse } from 'backend/downloads/types';
import { scanLibraryReleases } from 'backend/downloads';
import { withErrorHandler } from 'backend/exceptions/handler';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<Record<string, never>>;
};

export const POST = withErrorHandler(async (_request: Request, _context: RouteContext) => {
  const libraryReleases = await scanLibraryReleases();

  return NextResponse.json<ScanLibraryReleasesResponse>({
    libraryReleases,
  });
});
