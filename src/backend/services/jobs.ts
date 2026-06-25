import type { DownloadJobProgress, DownloadJobStatus } from 'common/types/requests/releases';
import { randomUUID } from 'node:crypto';

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
      jobId,
      processedTracks: 0,
      stage: 'queued',
      status: 'running',
    },
  });

  return jobId;
};

const getDownloadJobProgress = (jobId: string) => jobs.get(jobId)?.progress;

const updateDownloadJob = (
  jobId: string,
  partial: Omit<Partial<DownloadJobProgress>, 'jobId'>,
) => {
  const job = jobs.get(jobId);

  if (!job) {
    return;
  }

  job.progress = {
    ...job.progress,
    ...partial,
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

export const jobService = {
  createDownloadJob,
  getDownloadJobProgress,
  subscribeDownloadJob,
  updateDownloadJob,
};
