import { HttpStatusCode } from 'axios';
import { withErrorHandler } from 'backend/exceptions/handler';
import { failedTracksRepository } from 'backend/repositories/failedTracks.repository';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{
    trackId: string;
  }>;
};

export const DELETE = withErrorHandler(
  async (_request: Request, { params }: RouteContext): Promise<NextResponse> => {
    const { trackId } = await params;

    await failedTracksRepository.deleteFailedTrack(trackId);

    return NextResponse.json('', {
      status: HttpStatusCode.Ok,
    });
  },
);
