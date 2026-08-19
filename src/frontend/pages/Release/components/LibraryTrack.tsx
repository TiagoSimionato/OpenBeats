import type { TrackRecord } from 'common/types/requests/library';
import { Checkbox } from 'frontend/ui/Checkbox';
import { ActionDeleteTrack } from './ActionDeleteTrack';
import { ActionImportTrack } from './ActionImportTrack';
import { ActionReplaceFile } from './ActionReplaceFIle';
import { DropDownActions } from './DropDownActions';
import { useSelectedTracksStore } from './MultiActions/useSelectedTracksStore';

type LibraryTrackProps = {
  track: TrackRecord;
};

export const LibraryTrack = ({ track }: LibraryTrackProps) => {
  const { addTrack, removeTrack, tracks } = useSelectedTracksStore();

  return (
    <div className="group/track grid grid-cols-[repeat(3,1fr)_32px] gap-4 p-2 sm:grid-cols-[repeat(4,1fr)_32px]">
      <p className="col-span-2 flex items-center gap-3">
        <Checkbox
          checked={tracks.some(it => 'id' in it && it.id === track.id)}
          onChange={(event) => {
            if (event.target.checked)
              addTrack(track);
            if (!event.target.checked)
              removeTrack(track);
          }}
        />
        <span className="min-w-4 text-center">{track.trackNumber}</span>
        <span>{track.title}</span>
      </p>
      <p className="flex items-center">{track.artist}</p>
      <p className="hidden items-center sm:flex">{track.genre}</p>
      <div className="flex items-center justify-center">
        <DropDownActions ellipsisOnHover>
          <ActionImportTrack title={track.title} trackId={track.id} />
          <ActionReplaceFile title={track.title} trackId={track.id} />
          <ActionDeleteTrack title={track.title} trackId={track.id} />
        </DropDownActions>
      </div>
    </div>
  );
};
