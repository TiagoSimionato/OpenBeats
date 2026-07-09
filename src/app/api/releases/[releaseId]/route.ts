import type { StartDownloadResponse } from 'common/types/requests/releases';
import { HttpStatusCode } from 'axios';
import { withErrorHandler } from 'backend/exceptions/handler';
import { jobService } from 'backend/services/jobs.service';
import { libraryManagerService } from 'backend/services/libraryManager.service';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{
    releaseId: string;
  }>;
};

export const POST = withErrorHandler(
  async (_request: Request, { params }: RouteContext): Promise<NextResponse<StartDownloadResponse>> => {
    const { releaseId } = await params;

    const jobId = jobService.startDownloadJob(releaseId);

    return NextResponse.json({
      jobId,
    }, {
      status: HttpStatusCode.Accepted,
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
