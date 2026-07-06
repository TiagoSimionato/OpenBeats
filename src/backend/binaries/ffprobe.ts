import { execFileAsync } from 'backend/utils';
import { CONFIGS } from 'configs/constants';

type ProbeTags = {
  'album'?: string;
  'album_artist'?: string;
  'artist'?: string;
  'artist-sort'?: string;
  'date'?: string;
  'disc'?: string;
  'Disctotal'?: string;
  'genre'?: string;
  'MusicBrainz Album Artist Id'?: string;
  'MusicBrainz Album Id'?: string;
  'MusicBrainz Album Release Country'?: string;
  'MusicBrainz Album Status'?: string;
  'MusicBrainz Album Type'?: string;
  'MusicBrainz Artist Id'?: string;
  'MusicBrainz Release Group Id'?: string;
  'MusicBrainz Release Track Id'?: string;
  'MusicBrainz Track Id'?: string;
  'originalyear'?: string;
  'publisher'?: string;
  'TDOR'?: string;
  'title'?: string;
  'TMED'?: string;
  'track'?: string;
  'Tracktotal'?: string;
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
