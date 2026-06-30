import type { StartDownloadResponse } from 'common/types/requests/releases';
import { HttpStatusCode } from 'axios';
import { withErrorHandler } from 'backend/exceptions/handler';
import { libraryManagerService } from 'backend/services/manager.service';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{
    releaseId: string;
  }>;
};

export const POST = withErrorHandler(
  async (_request: Request, { params }: RouteContext): Promise<NextResponse<StartDownloadResponse>> => {
    const { releaseId } = await params;

    const jobId = libraryManagerService.startDownloadJob(releaseId);

    return NextResponse.json({
      jobId,
    }, {
      status: HttpStatusCode.Accepted,
    });
  },
);
