import type { TrackActions } from './types';
import { useImportTrackFile } from 'frontend/hooks/useImportTrackFile';
import { Button } from 'frontend/ui/Button';
import { Input } from 'frontend/ui/Input';
import { FileUpIcon } from 'lucide-react';
import { useRef } from 'react';

export const ActionImportTrack = ({ title, trackId }: TrackActions) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleImportFile } = useImportTrackFile();

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
          const file = e.target.files?.[0];
          if (file)
            handleImportFile({ file, title, trackId });
        }}
        ref={inputRef}
        type="file"
      />
    </Button>
  );
};
