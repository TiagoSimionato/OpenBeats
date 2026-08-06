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
    const paginationParams = {
      page: Number(request.nextUrl.searchParams.get('page') ?? 1),
      perPage: Number(request.nextUrl.searchParams.get('perPage') ?? 18),
    };
    const query = request.nextUrl.searchParams.get('query');
    const pagination = await buildPagination(paginationParams);

    const pagedLibraryReleases = await releasesRepository.listLibraryReleasesPaged(pagination, query);

    return NextResponse.json(pagedLibraryReleases);
  },
);
