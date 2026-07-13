import type { Track } from 'common/types/requests/releases';
import { useDownloadQueueContext } from 'frontend/contexts/QueueContext';
import { DownloadIcon } from 'lucide-react';

type MBTrackProps = {
  track: Track;
};

export const MBTRack = ({ track }: MBTrackProps) => {
  const { enqueueJob } = useDownloadQueueContext();

  return (
    <div className="flex justify-end gap-4">
      <p className="text-light mr-auto">
        {track.track}
        {'. '}
        {track.title}
      </p>
      <DownloadIcon
        onClick={() =>
          enqueueJob({
            releaseId: track['MusicBrainz Album Id'],
            title: track.title,
            totalTracks: 1,
            trackId: track['MusicBrainz Track Id'],
            type: 'track',
          })}
      />
    </div>
  );
};
