import { HttpStatusCode } from 'axios';
import { withErrorHandler } from 'backend/exceptions/handler';
import { libraryManagerService } from 'backend/services/library';
import { NextResponse } from 'next/server';

export const POST = withErrorHandler(
  async (_request: Request): Promise<NextResponse> => {
    libraryManagerService.covers.syncReleasesCover();

    return NextResponse.json('', {
      status: HttpStatusCode.Accepted,
    });
  },
);
