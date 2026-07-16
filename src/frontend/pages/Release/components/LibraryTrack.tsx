import type { TrackRecord } from 'common/types/requests/library';
import { ActionDeleteTrack } from './ActionDeleteTrack';
import { ActionReplaceFile } from './ActionReplaceFIle';

type LibraryTrackProps = {
  track: TrackRecord;
};

export const LibraryTrack = ({ track }: LibraryTrackProps) => (
  <div className="flex justify-end gap-4">
    <p className="mr-auto">
      {track?.trackNumber}
      {'. '}
      {track?.title}
    </p>
    <ActionReplaceFile releaseId={track.releaseId} title={track.title} trackId={track.id} />
    <ActionDeleteTrack releaseId={track.releaseId} title={track.title} trackId={track.id} />
  </div>
);
