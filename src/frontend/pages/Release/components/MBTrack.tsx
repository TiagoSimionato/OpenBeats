import type { Track } from 'common/types/requests/releases';
import { Checkbox } from 'frontend/ui/Checkbox';
import { ActionAddTrack } from './ActionAddTrack';
import { ActionImportTrack } from './ActionImportTrack';
import { ActionReplaceFile } from './ActionReplaceFIle';
import { DropDownActions } from './DropDownActions';
import { useSelectedTracksStore } from './MultiActions/useSelectedTracksStore';

type MBTrackProps = {
  track: Track;
};

export const MBTRack = ({ track }: MBTrackProps) => {
  const { addTrack, removeTrack, tracks } = useSelectedTracksStore();

  return (
    <div className="group/track text-light grid grid-cols-[repeat(3,1fr)_32px] gap-4 p-2 sm:grid-cols-[repeat(4,1fr)_32px]">
      <p className="col-span-2 flex items-center gap-3">
        <Checkbox
          checked={tracks.some(
            it =>
              'MusicBrainz Track Id' in it
              && it['MusicBrainz Track Id'] === track['MusicBrainz Track Id'],
          )}
          className="text-white"
          onChange={(event) => {
            if (event.target.checked)
              addTrack(track);
            if (!event.target.checked)
              removeTrack(track);
          }}
        />
        <span className="min-w-4 text-center">{track.track}</span>
        <span>{track.title}</span>
      </p>
      <p className="flex items-center">{track.artist}</p>
      <p className="hidden items-center sm:flex">{track.genre.join('; ')}</p>
      <div className="flex items-center justify-center text-white">
        <DropDownActions ellipsisOnHover>
          <ActionImportTrack title={track.title} trackId={track['MusicBrainz Track Id']} />
          <ActionReplaceFile title={track.title} trackId={track['MusicBrainz Track Id']} />
          <ActionAddTrack title={track.title} trackId={track['MusicBrainz Track Id']} />
        </DropDownActions>
      </div>
    </div>
  );
};
