import { useQueueContext } from 'frontend/contexts/QueueContext';
import { useAddTrack } from 'frontend/services/api/mutations/library';
import { Button } from 'frontend/ui/Button';
import { DownloadIcon } from 'lucide-react';
import { useSelectedTracksStore } from './useSelectedTracksStore';

export const MultiAddAction = () => {
  const { resetSelection, tracks } = useSelectedTracksStore();
  const { enqueueJob } = useQueueContext();
  const { mutateAsync: addTrack } = useAddTrack();

  if (!tracks.every(track => 'MusicBrainz Track Id' in track))
    return null;

  return (
    <Button
      onClick={() => {
        tracks.forEach((track) => {
          enqueueJob({
            id: track['MusicBrainz Track Id'],
            onStart: () =>
              addTrack({
                releaseId: track['MusicBrainz Album Id'],
                trackId: track['MusicBrainz Track Id'],
              }),
            title: track.title,
            totalTracks: 1,
          });
        });
        resetSelection();
      }}
      size="xs"
      title="Add Tracks to Library"
      variant="tertiary"
    >
      <DownloadIcon />
      Add tracks
    </Button>
  );
};
