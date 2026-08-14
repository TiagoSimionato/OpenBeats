import type { ReleasePageParams } from '../type';
import type { TrackActions } from './types';
import { useQueueContext } from 'frontend/contexts/QueueContext';
import { useImportTrack } from 'frontend/services/api/mutations/library';
import { Button } from 'frontend/ui/Button';
import { Input } from 'frontend/ui/Input';
import { FileUpIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRef } from 'react';

export const ActionImportTrack = ({ title, trackId }: TrackActions) => {
  const { releaseId } = useParams<ReleasePageParams>();
  const inputRef = useRef<HTMLInputElement>(null);
  const { enqueueJob } = useQueueContext();
  const { mutateAsync: importTrack } = useImportTrack();

  return (
    <Button
      onClick={() => inputRef.current?.click()}
      size="xs"
      title="Import file"
      variant="tertiary"
    >
      <FileUpIcon />
      Import Track
      <Input
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const formData = new FormData();
          const file = e.target.files?.[0];
          if (file) {
            formData.append('file', file);
            enqueueJob({
              id: trackId,
              onStart: () =>
                importTrack({
                  formData,
                  releaseId,
                  trackId,
                }),
              title,
              totalTracks: 1,
            });
          }
        }}
        ref={inputRef}
        type="file"
      />
    </Button>
  );
};
