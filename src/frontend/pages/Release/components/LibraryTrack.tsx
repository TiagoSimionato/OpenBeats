import type { TrackRecord } from 'common/types/requests/library';
import { useDownloadQueueContext } from 'frontend/contexts/QueueContext';
import { useAddCustomTrack, useDeleteLibraryTrack } from 'frontend/services/api/mutations/library';
import { Button } from 'frontend/ui/Button';
import { Dialog } from 'frontend/ui/Dialog';
import { Input } from 'frontend/ui/Input';
import { FileMusicIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

type LibraryTrackProps = {
  track: TrackRecord;
};

export const LibraryTrack = ({ track }: LibraryTrackProps) => {
  const { isPending, mutate: deleteTrack } = useDeleteLibraryTrack();
  const { mutateAsync: addCustomTrack } = useAddCustomTrack();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { enqueueJob } = useDownloadQueueContext();

  return (
    <div className="flex justify-end gap-4">
      <p className="mr-auto">
        {track?.trackNumber}
        {'. '}
        {track?.title}
      </p>
      <Button onClick={() => setOpen(true)} size="xs" variant="tertiary">
        <FileMusicIcon />
      </Button>
      <Button
        isLoading={isPending}
        onClick={() => deleteTrack({ releaseId: track.releaseId, trackId: track.id })}
        size="xs"
        variant="tertiary"
      >
        <TrashIcon />
      </Button>
      <Dialog className="flex flex-col gap-4" open={open} setOpen={setOpen}>
        <p>
          Enter a custom url to replace the file for track
          {' '}
          <span className="text-primary">{track.title}</span>
        </p>
        <Input
          onChange={event => setInputValue(event.target.value)}
          placeholder="Custom URL"
          value={inputValue}
        />
        <Button
          className="self-center"
          disabled={!inputValue}
          onClick={() => {
            enqueueJob({
              onStart: () =>
                addCustomTrack({
                  releaseId: track.releaseId,
                  trackId: track.id,
                  url: inputValue,
                }),
              releaseId: track.releaseId,
              title: track.title,
              totalTracks: 1,
            });
            setOpen(false);
          }}
        >
          Replace file
        </Button>
      </Dialog>
    </div>
  );
};
