import type {
  DownloadJobProgress,
  DownloadJobStage,
  DownloadJobStatus,
  JobResponse,
} from 'common/types/requests/releases';
import type { PropsWithChildren } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LIBRARY_QUERY_KEY } from 'frontend/services/api/queries/library';
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type QueueItem = {
  message?: string;
  onStart: () => Promise<JobResponse>;
  processedTracks: number;
  releaseId: string;
  stage: DownloadJobStage;
  status: DownloadJobStatus;
  title: string;
  totalTracks: number;
};

type EnqueueArgs = {
  onStart: QueueItem['onStart'];
  releaseId: string;
  title: string;
  totalTracks: number;
};

type QueueContextProps = {
  enqueueJob: (args: EnqueueArgs) => void;
  queue: QueueItem[];
};

const QueueContext = createContext<null | QueueContextProps>(null);

type QueueProviderProps = PropsWithChildren;

const isTerminalStatus = (status: DownloadJobStatus) =>
  status === 'completed' || status === 'failed';

export const QueueContextProvider = ({ children }: QueueProviderProps) => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const activeReleaseIdRef = useRef<null | string>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const clearTimerRef = useRef<null | number>(null);
  const queryClient = useQueryClient();

  const updateQueueItem = useCallback(
    (releaseId: string, update: (current: QueueItem) => QueueItem) => {
      setQueue((currentQueue) => {
        const nextQueue = currentQueue.map(item =>
          item.releaseId === releaseId ? update(item) : item,
        );
        return nextQueue;
      });
    },
    [],
  );

  const enqueueJob = useCallback(({ onStart, releaseId, title, totalTracks }: EnqueueArgs) => {
    setQueue((currentQueue) => {
      if (
        currentQueue.some(item => item.releaseId === releaseId && !isTerminalStatus(item.status))
      ) {
        return currentQueue;
      }

      return [
        ...currentQueue,
        {
          message: 'Waiting in queue',
          onStart,
          processedTracks: 0,
          releaseId,
          stage: 'queued',
          status: 'running',
          title,
          totalTracks,
        },
      ];
    });
  }, []);

  const clearRemovalTimer = useCallback(() => {
    if (!clearTimerRef.current) {
      return;
    }

    globalThis.clearTimeout(clearTimerRef.current);
    clearTimerRef.current = null;
  }, []);

  const scheduleRemoval = useCallback(
    (releaseId: string) => {
      clearRemovalTimer();

      clearTimerRef.current = window.setTimeout(() => {
        setQueue(currentQueue => currentQueue.filter(item => item.releaseId !== releaseId));
      }, 4000);
    },
    [clearRemovalTimer],
  );

  const finalizeJob = useCallback(
    (
      releaseId: string,
      status: DownloadJobStatus,
      fallbackProgress?: Pick<DownloadJobProgress, 'currentTrack'>,
    ) => {
      if (activeReleaseIdRef.current !== releaseId) {
        return;
      }

      updateQueueItem(releaseId, current => ({
        ...current,
        message: status === 'failed' ? 'Download failed' : 'Download complete',
        processedTracks: fallbackProgress?.currentTrack ?? current.processedTracks,
        stage: status === 'failed' ? 'failed' : 'completed',
        status,
        totalTracks: current.totalTracks,
      }));

      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      activeReleaseIdRef.current = null;
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
      scheduleRemoval(releaseId);
    },
    [queryClient, scheduleRemoval, updateQueueItem],
  );

  const startNextQueuedDownload = useCallback(() => {
    if (activeReleaseIdRef.current) {
      return;
    }

    const nextQueuedItem = queue.find(
      item => item.stage === 'queued' && item.status === 'running',
    );

    if (!nextQueuedItem) {
      return;
    }

    activeReleaseIdRef.current = nextQueuedItem.releaseId;
    updateQueueItem(nextQueuedItem.releaseId, current => ({
      ...current,
      message: 'Starting download',
    }));

    nextQueuedItem
      .onStart()
      .then(({ jobId }) => {
        if (activeReleaseIdRef.current !== nextQueuedItem.releaseId) {
          return;
        }

        updateQueueItem(nextQueuedItem.releaseId, current => ({
          ...current,
          jobId,
          message: 'Connected to job',
          stage: 'search',
        }));

        const eventSource = new EventSource(`/api/releases/jobs/${jobId}`);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          const nextProgress = JSON.parse(event.data) as DownloadJobProgress;

          updateQueueItem(nextQueuedItem.releaseId, current => ({
            ...current,
            message: nextProgress.message,
            processedTracks: nextProgress.currentTrack,
            stage: nextProgress.stage,
            status: nextProgress.status,
          }));

          if (isTerminalStatus(nextProgress.status)) {
            finalizeJob(nextQueuedItem.releaseId, nextProgress.status, nextProgress);
          }
        };

        eventSource.onerror = () => {
          finalizeJob(nextQueuedItem.releaseId, 'failed', {
            currentTrack: 0,
          });
        };
      })
      .catch(() => {
        if (activeReleaseIdRef.current !== nextQueuedItem.releaseId) {
          return;
        }

        updateQueueItem(nextQueuedItem.releaseId, current => ({
          ...current,
          message: 'Failed to start download',
          stage: 'failed',
          status: 'failed',
        }));

        activeReleaseIdRef.current = null;
        scheduleRemoval(nextQueuedItem.releaseId);
      });
  }, [finalizeJob, queue, scheduleRemoval, updateQueueItem]);

  useEffect(() => {
    startNextQueuedDownload();
  }, [queue, startNextQueuedDownload]);

  useEffect(
    () => () => {
      eventSourceRef.current?.close();
      clearRemovalTimer();
    },
    [clearRemovalTimer],
  );

  const value = useMemo(() => ({ enqueueJob, queue }), [enqueueJob, queue]);

  return <QueueContext value={value}>{children}</QueueContext>;
};

export const useDownloadQueueContext = () => {
  const context = use(QueueContext);

  if (!context) {
    throw new Error('useDownloadQueueContext must be used within DownloadQueueContextProvider');
  }

  return context;
};
