import { withErrorHandler } from 'backend/exceptions/handler';
import { NotFoundError } from 'backend/exceptions/http';
import { jobService } from 'backend/services/jobs';

type RouteContext = {
  params: Promise<{
    jobId: string;
  }>;
};

export const GET = withErrorHandler(async (_request: Request, { params }: RouteContext) => {
  const { jobId } = await params;

  const isJobFound = jobService.getDownloadJobProgress(jobId);
  if (!isJobFound)
    throw new NotFoundError('Job not found');

  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream<Uint8Array>({
    cancel: () => {
      cleanup();
    },
    start: (controller) => {
      const send = (payload: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      let heartbeat: ReturnType<typeof setInterval> | undefined;
      let unsubscribe = () => {};

      cleanup = () => {
        if (heartbeat) {
          clearInterval(heartbeat);
          heartbeat = undefined;
        }
        unsubscribe();
      };

      unsubscribe = jobService.subscribeDownloadJob(jobId, (progress) => {
        send(progress);

        if (progress.status === 'completed' || progress.status === 'failed') {
          cleanup();
          controller.close();
        }
      });

      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(':keepalive\n\n'));
      }, 15000);

      controller.enqueue(encoder.encode(':connected\n\n'));
    },
  });

  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Content-Type': 'text/event-stream',
    },
  });
});
