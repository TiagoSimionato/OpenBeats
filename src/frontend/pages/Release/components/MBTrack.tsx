import type { Track } from 'common/types/requests/releases';
import { DownloadIcon } from 'lucide-react';

type MBTrackProps = {
  track: Track;
};

export const MBTRack = ({ track }: MBTrackProps) => (
  <div className="flex justify-end gap-4">
    <p className="text-light mr-auto">
      {track.track}
      {'. '}
      {track.title}
    </p>
    <DownloadIcon />
  </div>
);
