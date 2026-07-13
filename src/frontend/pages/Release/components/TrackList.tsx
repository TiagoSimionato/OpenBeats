import type { LibraryReleaseData } from 'common/types/requests/library';
import type { Track } from 'common/types/requests/releases';
import { Fragment } from 'react/jsx-runtime';
import { LibraryTrack } from './LibraryTrack';
import { MBTRack } from './MBTrack';

export type ListTracks
  = | {
    libraryTrack: LibraryReleaseData['tracks'][0];
    mbTrack: Track;
  }
  | {
    libraryTrack: LibraryReleaseData['tracks'][0];
    mbTrack: undefined;
  }
  | {
    libraryTrack: undefined;
    mbTrack: Track;
  };

type ListTrackProps = {
  tracks: ListTracks[];
};

export const TrackList = ({ tracks }: ListTrackProps) =>
  tracks.map(({ libraryTrack, mbTrack }, index) => (
    <Fragment key={libraryTrack?.id ?? mbTrack?.['MusicBrainz Track Id']}>
      {index > 0 && index < tracks.length && <span className="border-primary border-t" />}
      {libraryTrack && <LibraryTrack track={libraryTrack} />}
      {!libraryTrack && mbTrack && <MBTRack track={mbTrack} />}
    </Fragment>
  ));
