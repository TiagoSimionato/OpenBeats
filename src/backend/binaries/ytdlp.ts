import type { Track } from 'common/types/requests/releases';
import { extname } from 'node:path';
import { execFileAsync, makeTrackPath, retryPromise } from 'backend/utils';
import { CONFIGS } from 'configs/constants';
import { handlePromise } from 'tsm-utils';
import YTMusic from 'ytmusic-api';

const getPerfectMatch = (results: Awaited<ReturnType<YTMusic['searchSongs']>>, track: Track) =>
  results.find(result => result.name?.toLowerCase() === track.title.toLowerCase()
    && result.album?.name.toLowerCase() === track.album.toLowerCase()
    && result.artist.name.toLowerCase() === track.artist.toLowerCase());

const getArtistMatch = (results: Awaited<ReturnType<YTMusic['searchSongs']>>, track: Track) =>
  results.find(result => result.name?.toLowerCase() === track.title.toLowerCase()
    && result.artist.name.toLowerCase() === track.artist.toLowerCase());

const getTrackMatch = (results: Awaited<ReturnType<YTMusic['searchSongs']>>, track: Track) =>
  results.find(result => result.name?.toLowerCase() === track.title.toLowerCase());

export const searchYTMusic = handlePromise(
  async (track: Track) => {
    const ytmusic = new YTMusic();
    await ytmusic.initialize();

    const query = `${track.title} - ${track.artist} - ${track.album}`;

    const results = await ytmusic.searchSongs(query);

    const topMatch = getPerfectMatch(results, track)
      ?? getArtistMatch(results, track)
      ?? getTrackMatch(results, track)
      ?? results[0];

    const videoId = topMatch.videoId;

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
    const fileExtension = extname(track.trackPath ?? '');
    const trackPathExtensionless = track.trackPath?.slice(0, -fileExtension.length || undefined);
    const outputTemplate = `${trackPathExtensionless ?? await makeTrackPath(track)}.%(ext)s`;

    let output = '';
    let stderr = '';

    const execYTDLP = retryPromise(async () => {
      const result = await execFileAsync(CONFIGS.YT_DLP_BIN, [
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
      stderr = result.stderr;
      output = result.stdout.trim();
    }, (error) => {
      console.error(`yt-dlp: ${error}`);
    });
    await execYTDLP(null);

    if (/WARNING: Your yt-dlp version .* is older than 90 days!/.test(stderr)) {
      execFileAsync(CONFIGS.YT_DLP_BIN, ['--update']).then(() => console.log('ytdlp: updated'));
    }

    const filePath = output
      .split('\n')
      .map(line => line.trim())
      .findLast(line => line.length > 0);

    if (!filePath) {
      track.trackPath = undefined;
      throw new Error('yt-dlp did not return a downloaded file path');
    }

    console.log(`ytdlp: New file at: [${output}]`);

    track.trackPath = filePath;
    return filePath;
  },
  (error) => {
    console.error(`yt-dlp: ${error}`);
  },
);
