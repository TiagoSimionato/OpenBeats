import type { FailedTracksAmountResponse } from 'common/types/requests/failedTracks';
import type { NextRequest } from 'next/server';
import { withErrorHandler } from 'backend/exceptions/handler';
import { failedTracksRepository } from 'backend/repositories/failedTracks.repository';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<Record<string, never>>;
};

export const GET = withErrorHandler(
  async (_request: NextRequest, _context: RouteContext): Promise<NextResponse<FailedTracksAmountResponse>> => {
    const failedTracks = await failedTracksRepository.listFailedTracks();

    return NextResponse.json({ amount: failedTracks.length });
  },
);
