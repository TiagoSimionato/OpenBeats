import { HttpStatusCode } from 'axios';
import { withErrorHandler } from 'backend/exceptions/handler';
import { libraryManagerService } from 'backend/services/libraryManager.service';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<Record<string, never>>;
};

export const POST = withErrorHandler(
  async (_request: Request, _context: RouteContext): Promise<NextResponse> => {
    libraryManagerService.scanLibraryReleases();

    return NextResponse.json('', { status: HttpStatusCode.Accepted });
  },
);
