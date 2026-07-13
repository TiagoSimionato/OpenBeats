import type { LibraryReleaseResponse } from 'common/types/requests/library';
import { HttpStatusCode } from 'axios';
import { throwError, withErrorHandler } from 'backend/exceptions/handler';
import { NotFoundError } from 'backend/exceptions/http';
import { releasesRepository } from 'backend/repositories/releases.repository';
import { libraryManagerService } from 'backend/services/libraryManager.service';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{
    releaseId: string;
  }>;
};

export const GET = withErrorHandler(
  async (_request: Request, { params }: RouteContext): Promise<NextResponse<LibraryReleaseResponse>> => {
    const { releaseId } = await params;
    const libraryRelease = await releasesRepository.getLibraryRelease(releaseId)
      ?? throwError(new NotFoundError('Release not found'));

    return NextResponse.json({
      libraryRelease,
    });
  },
);

export const DELETE = withErrorHandler(
  async (_request: Request, { params }: RouteContext): Promise<NextResponse> => {
    const { releaseId } = await params;

    await libraryManagerService.deleteRelease(releaseId);

    return NextResponse.json('', {
      status: HttpStatusCode.Ok,
    });
  },
);
