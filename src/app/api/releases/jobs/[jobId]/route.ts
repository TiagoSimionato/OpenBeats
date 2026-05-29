import { getDownloadJobProgress, subscribeDownloadJob } from 'backend/downloader/jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    jobId: string;
  }>;
};

export const GET = async (_request: Request, { params }: RouteContext) => {
  const { jobId } = await params;
  const initialProgress = getDownloadJobProgress(jobId);

  if (!initialProgress) {
    return Response.json({
      error: {
        message: 'Download job not found',
        status: 404,
      },
    }, {
      status: 404,
    });
  }

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

      unsubscribe = subscribeDownloadJob(jobId, (progress) => {
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
};
