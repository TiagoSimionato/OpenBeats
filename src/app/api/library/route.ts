import type { LibraryReleasesResponse } from 'common/types/requests/library';
import { listDownloadedReleases } from 'backend/downloads';
import { withErrorHandler } from 'backend/exceptions/handler';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<Record<string, never>>;
};

export const GET = withErrorHandler(
  async (_request: Request, _context: RouteContext): Promise<NextResponse<LibraryReleasesResponse>> => {
    const libraryReleases = await listDownloadedReleases();

    return NextResponse.json({
      libraryReleases,
    });
  },
);
