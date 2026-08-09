import type { LibraryReleasesResponse } from 'common/types/requests/library';
import type { NextRequest } from 'next/server';
import { withErrorHandler } from 'backend/exceptions/handler';
import { releasesRepository } from 'backend/repositories/releases.repository';
import { buildPagination } from 'backend/utils';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<Record<string, never>>;
};

export const GET = withErrorHandler(
  async (request: NextRequest, _context: RouteContext): Promise<NextResponse<LibraryReleasesResponse>> => {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const pagination = await buildPagination(params);
    const query = request.nextUrl.searchParams.get('query');

    const pagedLibraryReleases = await releasesRepository.listLibraryReleasesPaged(pagination, query);

    return NextResponse.json(pagedLibraryReleases);
  },
);
