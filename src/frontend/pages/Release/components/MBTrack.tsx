import type { Track } from 'common/types/requests/releases';
import { useQueueContext } from 'frontend/contexts/QueueContext';
import { useAddTrack } from 'frontend/services/api/mutations/library';
import { Button } from 'frontend/ui/Button';
import { DownloadIcon } from 'lucide-react';

type MBTrackProps = {
  track: Track;
};

export const MBTRack = ({ track }: MBTrackProps) => {
  const { enqueueJob } = useQueueContext();
  const { mutateAsync: addTrack } = useAddTrack();

  return (
    <div className="flex justify-end gap-4">
      <p className="text-light mr-auto">
        {track.track}
        {'. '}
        {track.title}
      </p>
      <Button
        onClick={() =>
          enqueueJob({
            onStart: () =>
              addTrack({
                releaseId: track['MusicBrainz Album Id'],
                trackId: track['MusicBrainz Track Id'],
              }),
            releaseId: track['MusicBrainz Album Id'],
            title: track.title,
            totalTracks: 1,
          })}
        size="xs"
        variant="tertiary"
      >
        <DownloadIcon />
      </Button>
    </div>
  );
};
