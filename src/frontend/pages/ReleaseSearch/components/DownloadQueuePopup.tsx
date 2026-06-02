import type { DownloadJobStage, DownloadJobStatus } from 'backend/downloader/types';
import { Spinner } from 'frontend/ui/Spinner';

export type DownloadQueueItem = {
  message?: string;
  processedTracks: number;
  releaseId: string;
  stage: DownloadJobStage;
  status: DownloadJobStatus;
  title: string;
  totalTracks: number;
};

const stageLabel: Partial<Record<DownloadJobStage, string>> = {
  completed: 'Completed',
  cover: 'Cover',
  download: 'Downloading',
  failed: 'Failed',
  metadata: 'Tagging',
  queued: 'Queued',
  search: 'Searching',
};

export const DownloadQueuePopup = ({
  items,
}: Readonly<{
  items: DownloadQueueItem[];
}>) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="fixed bottom-4 right-4 z-50 w-full max-w-sm rounded-xl border border-border bg-card/95 p-3 text-foreground shadow-glow backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Download Queue</h2>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          {items.length}
        </span>
      </div>
      <ul className="max-h-72 space-y-2 overflow-y-auto">
        {items.map((item) => {
          const isDone = item.status === 'completed';
          const isFailed = item.status === 'failed';
          const progressRatio = item.totalTracks > 0 ? item.processedTracks / item.totalTracks : 0;
          const progressPercent = Math.max(0, Math.min(100, Math.round(progressRatio * 100)));

          return (
            <li className="rounded-lg border border-border bg-background/40 p-2" key={item.releaseId}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{item.title}</p>
                  <p className="text-[11px] text-zinc-400">
                    {item.message ?? stageLabel[item.stage] ?? 'Working'}
                  </p>
                </div>
                {!isDone && !isFailed
                  ? <Spinner color="text-primary" size="xs" />
                  : null}
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full ${isFailed ? 'bg-red-500' : 'bg-primary'}`}
                  style={{ width: `${isFailed ? 100 : progressPercent}%` }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
                <span>{isFailed ? 'Failed' : `${item.processedTracks}/${item.totalTracks}`}</span>
                <span>{isFailed ? 'Error' : `${progressPercent}%`}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
