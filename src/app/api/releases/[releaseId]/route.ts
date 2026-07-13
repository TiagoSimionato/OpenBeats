import type { JobResponse } from 'common/types/requests/releases';
import { HttpStatusCode } from 'axios';
import { withErrorHandler } from 'backend/exceptions/handler';
import { jobService } from 'backend/services/jobs.service';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{
    releaseId: string;
  }>;
};

export const POST = withErrorHandler(
  async (_request: Request, { params }: RouteContext): Promise<NextResponse<JobResponse>> => {
    const { releaseId } = await params;

    const jobId = jobService.startReleaseJob(releaseId);

    return NextResponse.json({
      jobId,
    }, {
      status: HttpStatusCode.Accepted,
    });
  },
);
