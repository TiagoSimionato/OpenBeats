import type { Track } from 'common/types/requests/releases';
import { ActionAddTrack } from './ActionAddTrack';
import { ActionImportTrack } from './ActionImportTrack';
import { ActionReplaceFile } from './ActionReplaceFIle';
import { DropDownActions } from './DropDownActions';

type MBTrackProps = {
  track: Track;
};

export const MBTRack = ({ track }: MBTrackProps) => (
  <div className="group flex items-center justify-end gap-4 p-2">
    <p className="text-light mr-auto">
      {track.track}
      {'. '}
      {track.title}
    </p>
    <DropDownActions ellipsisOnHover>
      <ActionImportTrack title={track.title} trackId={track['MusicBrainz Track Id']} />
      <ActionReplaceFile title={track.title} trackId={track['MusicBrainz Track Id']} />
      <ActionAddTrack title={track.title} trackId={track['MusicBrainz Track Id']} />
    </DropDownActions>
  </div>
);
