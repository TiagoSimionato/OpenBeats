import type { TrackRequestParams } from 'common/types/requests/library';
import type { JobProgress, JobStatus } from 'common/types/requests/releases';
import { randomUUID } from 'node:crypto';
import { failedTracksRepository } from 'backend/repositories/failedTracks.repository';
import { libraryManagerService } from './library';

type JobSubscriber = (progress: JobProgress) => void;

type JobState = {
  listeners: Set<JobSubscriber>;
  progress: JobProgress;
};

const TERMINAL_STATUSES: Set<JobStatus> = new Set([
  'completed',
  'failed',
]);

const jobs = new Map<string, JobState>();

const emit = (jobId: string) => {
  const job = jobs.get(jobId);

  if (!job) {
    return;
  }

  for (const listener of job.listeners) {
    listener(job.progress);
  }
};

const createJob = () => {
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

const getJobProgress = (jobId: string) => jobs.get(jobId)?.progress;

const updateJob = (
  jobId: string,
  progressUpdates: Omit<Partial<JobProgress>, 'jobId'>,
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

const subscribeJob = (
  jobId: string,
  listener: JobSubscriber,
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

      unsubscribe = subscribeJob(jobId, (progress) => {
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
  const jobId = createJob();

  libraryManagerService.add.addReleaseToLibrary(releaseId, (progressReport) => {
    updateJob(jobId, {
      status: 'running',
      ...progressReport,
    });
    if (progressReport.error) {
      const job = getJobProgress(jobId);
      failedTracksRepository.upsertFailedTrack({
        artist: job?.artist ?? releaseId,
        reason: progressReport.error,
        releaseId,
        title: job?.currentTrackTitle,
        trackId: releaseId,
      });
    }
  });

  return jobId;
};

const startTrackJob = ({ releaseId, trackId, url }: TrackRequestParams): string => {
  const jobId = createJob();

  libraryManagerService.add.addTrackToLibrary({ releaseId, trackId, url }, (progressReport) => {
    updateJob(jobId, {
      status: 'running',
      ...progressReport,
    });
    if (progressReport.error) {
      const job = getJobProgress(jobId);
      failedTracksRepository.upsertFailedTrack({
        artist: job?.artist ?? releaseId,
        reason: progressReport.error,
        releaseId,
        title: job?.currentTrackTitle ?? trackId,
        trackId,
      });
    }
  });

  return jobId;
};

const startImportJob = ({ file, releaseId, trackId }: Omit<TrackRequestParams, 'url'> & { file: File }): string => {
  const jobId = createJob();

  libraryManagerService.add.addTrackToLibrary({ file, releaseId, trackId }, (progressReport) => {
    updateJob(jobId, {
      status: 'running',
      ...progressReport,
    });
    if (progressReport.error) {
      const job = getJobProgress(jobId);
      failedTracksRepository.upsertFailedTrack({
        artist: job?.artist,
        reason: progressReport.error,
        releaseId,
        title: job?.currentTrackTitle,
        trackId,
      });
    }
  });

  return jobId;
};

export const jobService = {
  getJobProgress,
  startImportJob,
  startReleaseJob,
  startTrackJob,
  stream,
};
