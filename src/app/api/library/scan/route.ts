import { HttpStatusCode } from 'axios';
import { withErrorHandler } from 'backend/exceptions/handler';
import { libraryManagerService } from 'backend/services/library';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<Record<string, never>>;
};

export const POST = withErrorHandler(
  async (_request: Request, _context: RouteContext): Promise<NextResponse> => {
    libraryManagerService.scanner.scanLibrary();

    return NextResponse.json('', { status: HttpStatusCode.Accepted });
  },
);
