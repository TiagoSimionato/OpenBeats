import type { TrackRecord } from 'common/types/requests/library';
import type { Track } from 'common/types/requests/releases';
import type { DragoDropProps } from 'frontend/ui/DragDrop';
import { useImportTrackFile } from 'frontend/hooks/useImportTrackFile';
import { DragoDrop } from 'frontend/ui/DragDrop';

type DragoDropImportTrackProps = Omit<DragoDropProps, 'handleDrop'> & {
  track: Track | TrackRecord;
};

export const DragoDropImportTrack = ({ track, ...props }: DragoDropImportTrackProps) => {
  const { handleImportFile } = useImportTrackFile();

  return (
    <DragoDrop
      dragOverTitle={`Import track ${track.title}`}
      handleDrop={(event) => {
        const file = event.dataTransfer.files?.[0];
        if (file) {
          if ('id' in track)
            return handleImportFile({ file, title: track.title, trackId: track.id });
          handleImportFile({ file, title: track.title, trackId: track['MusicBrainz Track Id'] });
        }
      }}
      title={`Import track ${track.title}`}
      {...props}
    />
  );
};
