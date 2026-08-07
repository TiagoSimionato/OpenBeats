import type { JobResponse } from 'common/types/requests/releases';
import type { NextRequest } from 'next/server';
import { HttpStatusCode } from 'axios';
import { withErrorHandler } from 'backend/exceptions/handler';
import { CustomTrackRequest } from 'backend/requests/track.module';
import { jobService } from 'backend/services/jobs.service';
import { buildDTO } from 'backend/utils';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{
    releaseId: string;
  }>;
};

export const POST = withErrorHandler(
  async (request: NextRequest, { params }: RouteContext): Promise<NextResponse<JobResponse>> => {
    const { releaseId } = await params;

    const dto = await buildDTO(new CustomTrackRequest(), await request.json());

    const jobId = jobService.startTrackJob({ releaseId, trackId: dto.trackId, url: dto.url });

    return NextResponse.json({
      jobId,
    }, {
      status: HttpStatusCode.Accepted,
    });
  },
);
