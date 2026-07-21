import type { Track } from 'common/types/requests/releases';
import { mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { execFileAsync, padTrack, sanitize } from 'backend/utils';
import { CONFIGS } from 'configs/constants';
import { handlePromise } from 'tsm-utils';

export const searchYouTubeMusic = handlePromise(
  async (track: Track) => {
    const query = `${track.title} - ${track.artist} - ${track.album}`;

    const { stdout } = await execFileAsync(CONFIGS.PYTHON_BIN, [
      CONFIGS.YTMUSIC_SCRIPT_PATH,
      query,
      '1',
    ], {
      maxBuffer: 10 * 1024 * 1024,
    });

    const results = JSON.parse(stdout) as { resultType?: string; title?: string; videoId?: string }[];

    const topMatch = results.find(result => result.resultType === 'song' && !!result.videoId && result.title?.toLowerCase() === track.title.toLowerCase()) ?? results.find(result => !!result.videoId);

    const videoId = topMatch?.videoId;

    console.log(`ytmusic: query [${query}] returned ${results.length} result with main [${videoId}]`);

    return videoId;
  },
  (error) => {
    console.log(`ytmusic: ${error}`);
  },
);

export const runYtdlp = handlePromise(
  async ({
    isCustomUrl,
    track,
    videoId,
  }: {
    isCustomUrl?: boolean;
    track: Track;
    videoId: string;
  }) => {
    const absoluteLibraryPath = resolve(CONFIGS.DOWNLOAD_PATH);
    await mkdir(absoluteLibraryPath, { recursive: true });

    const albumArtist = sanitize(track.album_artist || 'Unknown Artist');
    const album = sanitize(track.album || 'Unknown Album');
    const title = sanitize(track.title || 'Untitled');
    const trackNumber = padTrack(track.track);

    const dir = join(absoluteLibraryPath, albumArtist, album);
    await mkdir(dir, { recursive: true });

    const outputTemplate = join(dir, `${trackNumber}. ${title}.%(ext)s`);

    const { stdout } = await execFileAsync(CONFIGS.YT_DLP_BIN, [
      '--ignore-errors',
      '--format',
      'bestaudio',
      '--extract-audio',
      '--audio-format',
      'mp3',
      '--audio-quality',
      '160K',
      '--output',
      outputTemplate,
      '--print',
      'after_move:filepath',
      ...(isCustomUrl ? ['--force-overwrite', videoId] : [`https://www.youtube.com/watch?v=${videoId}`]),
    ], {
      maxBuffer: 10 * 1024 * 1024,
    });

    const output = stdout.trim();
    const filePath = output
      .split('\n')
      .map(line => line.trim())
      .findLast(line => line.length > 0);

    if (!filePath) {
      throw new Error('yt-dlp did not return a downloaded file path');
    }

    console.log(`ytdlp: New file at: [${output}]`);

    return filePath;
  },
  (error) => {
    console.error(`yt-dlp: ${error}`);
  },
);
