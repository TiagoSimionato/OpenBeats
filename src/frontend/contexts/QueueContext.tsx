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

type EnqueueArgs = {
  id: string;
  onStart: () => Promise<JobResponse>;
  title: string;
  totalTracks: number;
};

export type QueueItem = EnqueueArgs & {
  message?: string;
  processedTracks: number;
  stage: DownloadJobStage;
  status: DownloadJobStatus;
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
  const activeQueueIdRef = useRef<null | string>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const clearTimerRef = useRef<null | number>(null);
  const queryClient = useQueryClient();

  const updateQueueItem = useCallback(
    (queueId: string, update: (current: QueueItem) => QueueItem) => {
      setQueue((currentQueue) => {
        const nextQueue = currentQueue.map(item => (item.id === queueId ? update(item) : item));
        return nextQueue;
      });
    },
    [],
  );

  const enqueueJob = useCallback(({ id, onStart, title, totalTracks }: EnqueueArgs) => {
    setQueue((currentQueue) => {
      if (currentQueue.some(item => item.id === id && !isTerminalStatus(item.status))) {
        return currentQueue;
      }

      return [
        ...currentQueue,
        {
          id,
          message: 'Waiting in queue',
          onStart,
          processedTracks: 0,
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
    (queueId: string) => {
      clearRemovalTimer();

      clearTimerRef.current = window.setTimeout(() => {
        setQueue(currentQueue => currentQueue.filter(item => item.id !== queueId));
      }, 4000);
    },
    [clearRemovalTimer],
  );

  const finalizeJob = useCallback(
    (
      queueId: string,
      status: DownloadJobStatus,
      fallbackProgress?: Pick<DownloadJobProgress, 'currentTrack'>,
    ) => {
      if (activeQueueIdRef.current !== queueId) {
        return;
      }

      updateQueueItem(queueId, current => ({
        ...current,
        message: status === 'failed' ? 'Download failed' : 'Download complete',
        processedTracks: fallbackProgress?.currentTrack ?? current.processedTracks,
        stage: status === 'failed' ? 'failed' : 'completed',
        status,
        totalTracks: current.totalTracks,
      }));

      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      activeQueueIdRef.current = null;
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
      scheduleRemoval(queueId);
    },
    [queryClient, scheduleRemoval, updateQueueItem],
  );

  const startNextQueuedDownload = useCallback(() => {
    if (activeQueueIdRef.current) {
      return;
    }

    const nextQueuedItem = queue.find(
      item => item.stage === 'queued' && item.status === 'running',
    );

    if (!nextQueuedItem) {
      return;
    }

    activeQueueIdRef.current = nextQueuedItem.id;
    updateQueueItem(nextQueuedItem.id, current => ({
      ...current,
      message: 'Starting download',
    }));

    nextQueuedItem
      .onStart()
      .then(({ jobId }) => {
        if (activeQueueIdRef.current !== nextQueuedItem.id) {
          return;
        }

        updateQueueItem(nextQueuedItem.id, current => ({
          ...current,
          jobId,
          message: 'Connected to job',
          stage: 'search',
        }));

        const eventSource = new EventSource(`/api/releases/jobs/${jobId}`);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          const nextProgress = JSON.parse(event.data) as DownloadJobProgress;

          updateQueueItem(nextQueuedItem.id, current => ({
            ...current,
            message: nextProgress.message,
            processedTracks: nextProgress.currentTrack,
            stage: nextProgress.stage,
            status: nextProgress.status,
          }));

          if (isTerminalStatus(nextProgress.status)) {
            finalizeJob(nextQueuedItem.id, nextProgress.status, nextProgress);
          }
        };

        eventSource.onerror = () => {
          finalizeJob(nextQueuedItem.id, 'failed', {
            currentTrack: 0,
          });
        };
      })
      .catch(() => {
        if (activeQueueIdRef.current !== nextQueuedItem.id) {
          return;
        }

        updateQueueItem(nextQueuedItem.id, current => ({
          ...current,
          message: 'Failed to start download',
          stage: 'failed',
          status: 'failed',
        }));

        activeQueueIdRef.current = null;
        scheduleRemoval(nextQueuedItem.id);
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

export const useQueueContext = () => {
  const context = use(QueueContext);

  if (!context) {
    throw new Error('useDownloadQueueContext must be used within DownloadQueueContextProvider');
  }

  return context;
};
