import type { Track } from 'common/types/requests/releases';
import { ActionAddTrack } from './ActionAddTrack';
import { ActionReplaceFile } from './ActionReplaceFIle';

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
    <ActionReplaceFile
      releaseId={track['MusicBrainz Album Id']}
      title={track.title}
      trackId={track['MusicBrainz Track Id']}
    />
    <ActionAddTrack
      releaseId={track['MusicBrainz Album Id']}
      title={track.title}
      trackId={track['MusicBrainz Track Id']}
    />
  </div>
);
