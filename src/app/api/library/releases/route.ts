import type { LibraryReleasesResponse } from 'common/types/requests/library';
import { withErrorHandler } from 'backend/exceptions/handler';
import { releasesRepository } from 'backend/repositories/releases.repository';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<Record<string, never>>;
};

export const GET = withErrorHandler(
  async (_request: Request, _context: RouteContext): Promise<NextResponse<LibraryReleasesResponse>> => {
    const libraryReleases = await releasesRepository.listLibraryReleases();

    return NextResponse.json({
      libraryReleases,
    });
  },
);
