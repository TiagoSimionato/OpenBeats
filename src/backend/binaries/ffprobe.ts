import { execFileAsync } from 'backend/utils';
import { CONFIGS } from 'configs/constants';

type ProbeTags = {
  'album'?: string;
  'ALBUM'?: string;
  'album_artist'?: string;
  'artist'?: string;
  'ARTIST'?: string;
  'artist-sort'?: string;
  'ARTISTS'?: string;
  'ARTISTSORT'?: string;
  'date'?: string;
  'DATE'?: string;
  'disc'?: string;
  'Disctotal'?: string;
  'DISCTOTAL'?: string;
  'genre'?: string;
  'GENRE'?: string;
  'LABEL'?: string;
  'MEDIA'?: string;
  'MUSICBRAINZ_ALBUMARTISTID'?: string;
  'MUSICBRAINZ_ALBUMID'?: string;
  'MUSICBRAINZ_ARTISTID'?: string;
  'MUSICBRAINZ_RELEASEGROUPID'?: string;
  'MUSICBRAINZ_RELEASETRACKID'?: string;
  'MUSICBRAINZ_TRACKID'?: string;
  'MusicBrainz Album Artist Id'?: string;
  'MusicBrainz Album Id'?: string;
  'MusicBrainz Album Release Country'?: string;
  'MusicBrainz Album Status'?: string;
  'MusicBrainz Album Type'?: string;
  'MusicBrainz Artist Id'?: string;
  'MusicBrainz Release Group Id'?: string;
  'MusicBrainz Release Track Id'?: string;
  'MusicBrainz Track Id'?: string;
  'ORIGINALDATE'?: string;
  'originalyear'?: string;
  'ORIGINALYEAR'?: string;
  'publisher'?: string;
  'RELEASECOUNTRY'?: string;
  'RELEASESTATUS'?: string;
  'RELEASETYPE'?: string;
  'TDOR'?: string;
  'title'?: string;
  'TITLE'?: string;
  'TMED'?: string;
  'TOTALDISCS'?: string;
  'TOTALTRACKS'?: string;
  'track'?: string;
  'Tracktotal'?: string;
  'TRACKTOTAL'?: string;
  'TSO2'?: string;
};

export type ProbeResponse = {
  format?: {
    tags?: ProbeTags;
  };
};

export const probeAudioFile = async (filePath: string) => {
  const { stdout } = await execFileAsync(CONFIGS.FFPROBE_BIN, [
    '-v',
    'quiet',
    '-print_format',
    'json',
    '-show_format',
    filePath,
  ], {
    maxBuffer: 10 * 1024 * 1024,
  });

  return JSON.parse(stdout) as ProbeResponse;
};
