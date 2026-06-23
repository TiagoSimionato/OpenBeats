import type { StartDownloadResponse } from 'backend/downloader/types';
import { HttpStatusCode } from 'axios';
import { withErrorHandler } from 'backend/exceptions/handler';
import { libraryManagerService } from 'backend/services/manager';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{
    releaseId: string;
  }>;
};

export const POST = withErrorHandler(async (_request: Request, { params }: RouteContext) => {
  const { releaseId } = await params;

  const jobId = libraryManagerService.startDownloadJob(releaseId);

  return NextResponse.json<StartDownloadResponse>({
    jobId,
  }, {
    status: HttpStatusCode.Accepted,
  });
});
