import type { TrackRequestParams } from 'common/types/requests/library';
import type { DownloadJobProgress, DownloadJobStatus } from 'common/types/requests/releases';
import { randomUUID } from 'node:crypto';
import { libraryManagerService } from './libraryManager.service';

type DownloadJobSubscriber = (progress: DownloadJobProgress) => void;

type DownloadJobState = {
  listeners: Set<DownloadJobSubscriber>;
  progress: DownloadJobProgress;
};

const TERMINAL_STATUSES: Set<DownloadJobStatus> = new Set([
  'completed',
  'failed',
]);

const jobs = new Map<string, DownloadJobState>();

const emit = (jobId: string) => {
  const job = jobs.get(jobId);

  if (!job) {
    return;
  }

  for (const listener of job.listeners) {
    listener(job.progress);
  }
};

const createDownloadJob = () => {
  const jobId = randomUUID();

  jobs.set(jobId, {
    listeners: new Set(),
    progress: {
      currentTrack: 0,
      jobId,
      stage: 'queued',
      status: 'running',
    },
  });

  return jobId;
};

const getDownloadJobProgress = (jobId: string) => jobs.get(jobId)?.progress;

const updateDownloadJob = (
  jobId: string,
  progressUpdates: Omit<Partial<DownloadJobProgress>, 'jobId'>,
) => {
  const job = jobs.get(jobId);

  if (!job) {
    return;
  }

  job.progress = {
    ...job.progress,
    ...progressUpdates,
    jobId,
  };

  emit(jobId);

  if (job.progress.status && TERMINAL_STATUSES.has(job.progress.status)) {
    setTimeout(() => {
      jobs.delete(jobId);
    }, 5 * 60 * 1000);
  }
};

const subscribeDownloadJob = (
  jobId: string,
  listener: DownloadJobSubscriber,
) => {
  const job = jobs.get(jobId);

  if (!job) {
    return () => {};
  }

  job.listeners.add(listener);
  listener(job.progress);

  return () => {
    const currentJob = jobs.get(jobId);

    if (!currentJob) {
      return;
    }

    currentJob.listeners.delete(listener);
  };
};

const stream = (jobId: string) => {
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

  return stream;
};

const startReleaseJob = (releaseId: string): string => {
  const jobId = createDownloadJob();

  libraryManagerService.addReleaseToLibrary(releaseId, partial => updateDownloadJob(jobId, {
    status: 'running',
    ...partial,
  }));

  return jobId;
};

const startTrackJob = ({ releaseId, trackId }: TrackRequestParams): string => {
  const jobId = createDownloadJob();

  libraryManagerService.addTrackToLibrary({ releaseId, trackId }, partial => updateDownloadJob(jobId, {
    status: 'running',
    ...partial,
  }));

  return jobId;
};

export const jobService = {
  createDownloadJob,
  getDownloadJobProgress,
  startReleaseJob,
  startTrackJob,
  stream,
  updateDownloadJob,
};
