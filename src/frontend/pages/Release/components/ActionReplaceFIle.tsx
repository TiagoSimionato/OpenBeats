import type { ReleasePageParams } from '../type';
import type { TrackActions } from './types';
import { useQueueContext } from 'frontend/contexts/QueueContext';
import { useAddCustomTrack } from 'frontend/services/api/mutations/library';
import { Button } from 'frontend/ui/Button';
import { Dialog } from 'frontend/ui/Dialog';
import { Input } from 'frontend/ui/Input';
import { FileMusicIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

export const ActionReplaceFile = ({ title, trackId }: TrackActions) => {
  const { releaseId } = useParams<ReleasePageParams>();
  const { mutateAsync: addCustomTrack } = useAddCustomTrack();
  const { enqueueJob } = useQueueContext();
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="xs" title="Replace track file" variant="tertiary">
        <FileMusicIcon />
      </Button>
      <Dialog className="gap-4" open={open} setOpen={setOpen}>
        <p className="md:text-xl">
          Enter a custom url to replace the file for track
          {' '}
          <span className="text-primary">{title}</span>
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
              id: trackId,
              onStart: () =>
                addCustomTrack({
                  releaseId,
                  trackId,
                  url: inputValue,
                }),
              title,
              totalTracks: 1,
            });
            setOpen(false);
          }}
        >
          Replace file
        </Button>
      </Dialog>
    </>
  );
};
