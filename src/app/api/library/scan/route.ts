import type { ScanLibraryReleasesResponse } from 'common/types/requests/library';
import { scanLibraryReleases } from 'backend/downloads';
import { withErrorHandler } from 'backend/exceptions/handler';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<Record<string, never>>;
};

export const POST = withErrorHandler(
  async (_request: Request, _context: RouteContext): Promise<NextResponse<ScanLibraryReleasesResponse>> => {
    const libraryReleases = await scanLibraryReleases();

    return NextResponse.json({
      libraryReleases,
    });
  },
);
