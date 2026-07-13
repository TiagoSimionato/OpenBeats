import { HttpStatusCode } from 'axios';
import { withErrorHandler } from 'backend/exceptions/handler';
import { libraryManagerService } from 'backend/services/libraryManager.service';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{
    releaseId: string;
    trackId: string;
  }>;
};

export const DELETE = withErrorHandler(
  async (_request: Request, { params }: RouteContext): Promise<NextResponse> => {
    const { releaseId, trackId } = await params;

    await libraryManagerService.deleteTrack({ releaseId, trackId });

    return NextResponse.json('', {
      status: HttpStatusCode.Ok,
    });
  },
);
