import type { JobResponse } from 'common/types/requests/releases';
import type { NextRequest } from 'next/server';
import { HttpStatusCode } from 'axios';
import { withErrorHandler } from 'backend/exceptions/handler';
import { BadRequestError } from 'backend/exceptions/http';
import { jobService } from 'backend/services/jobs.service';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{
    releaseId: string;
    trackId: string;
  }>;
};

export const POST = withErrorHandler(
  async (request: NextRequest, { params }: RouteContext): Promise<NextResponse<JobResponse>> => {
    const { releaseId, trackId } = await params;

    const file = (await request.formData()).get('file');

    if (!(file instanceof File))
      throw new BadRequestError('File not received');
    if (!file.type.includes('audio'))
      throw new BadRequestError('Received file is not an audio');

    const jobId = jobService.startImportJob({ file, releaseId, trackId });

    return NextResponse.json({
      jobId,
    }, {
      status: HttpStatusCode.Accepted,
    });
  },
);
