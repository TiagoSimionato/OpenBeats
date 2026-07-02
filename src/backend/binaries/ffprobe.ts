import { execFileAsync } from 'backend/utils';
import { CONFIGS } from 'configs/constants';

type ProbeTags = {
  'album'?: string;
  'album_artist'?: string;
  'artist'?: string;
  'MusicBrainz Album Artist Id'?: string;
  'MusicBrainz Album Id'?: string;
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
