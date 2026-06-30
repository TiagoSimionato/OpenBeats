import type { ScanLibraryReleasesResponse } from 'common/types/requests/library';
import { withErrorHandler } from 'backend/exceptions/handler';
import { dbService } from 'backend/services/db.service';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<Record<string, never>>;
};

export const POST = withErrorHandler(
  async (_request: Request, _context: RouteContext): Promise<NextResponse<ScanLibraryReleasesResponse>> => {
    const libraryReleases = await dbService.scanLibraryReleases();

    return NextResponse.json({
      libraryReleases,
    });
  },
);
