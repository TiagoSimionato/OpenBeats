import type { LibraryReleasesResponse } from 'common/types/requests/library';
import type { NextRequest } from 'next/server';
import { withErrorHandler } from 'backend/exceptions/handler';
import { releasesRepository } from 'backend/repositories/releases.repository';
import { ReleasesFilters } from 'backend/requests/releases';
import { buildDTO, buildPagination } from 'backend/utils';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<Record<string, never>>;
};

export const GET = withErrorHandler(
  async (request: NextRequest, _context: RouteContext): Promise<NextResponse<LibraryReleasesResponse>> => {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const pagination = await buildPagination(params);
    const filters = await buildDTO(ReleasesFilters, params, false);

    const pagedLibraryReleases = await releasesRepository.listLibraryReleasesPaged(pagination, filters);

    return NextResponse.json(pagedLibraryReleases);
  },
);
