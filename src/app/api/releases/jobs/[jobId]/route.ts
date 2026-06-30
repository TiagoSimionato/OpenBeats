import { withErrorHandler } from 'backend/exceptions/handler';
import { NotFoundError } from 'backend/exceptions/http';
import { jobService } from 'backend/services/jobs';

type RouteContext = {
  params: Promise<{
    jobId: string;
  }>;
};

export const GET = withErrorHandler(
  async (_request: Request, { params }: RouteContext) => {
    const { jobId } = await params;

    const isJobFound = jobService.getDownloadJobProgress(jobId);
    if (!isJobFound)
      throw new NotFoundError('Job not found');

    const stream = jobService.stream(jobId);

    return new Response(stream, {
      headers: {
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Content-Type': 'text/event-stream',
      },
    });
  },
);
