import type { TrackRecord } from 'common/types/requests/library';
import { ActionDeleteTrack } from './ActionDeleteTrack';
import { ActionImportTrack } from './ActionImportTrack';
import { ActionReplaceFile } from './ActionReplaceFIle';
import { DropDownActions } from './DropDownActions';

type LibraryTrackProps = {
  track: TrackRecord;
};

export const LibraryTrack = ({ track }: LibraryTrackProps) => (
  <div className="group flex items-center justify-end gap-4 p-2">
    <p className="mr-auto">
      {track?.trackNumber}
      {'. '}
      {track?.title}
    </p>
    <DropDownActions ellipsisOnHover>
      <ActionImportTrack title={track.title} trackId={track.id} />
      <ActionReplaceFile title={track.title} trackId={track.id} />
      <ActionDeleteTrack title={track.title} trackId={track.id} />
    </DropDownActions>
  </div>
);
