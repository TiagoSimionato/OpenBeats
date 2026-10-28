import type { Track } from 'common/types/requests/releases';
import type { OnProgress } from '.';
import { runYtdlp, searchYTMusic } from 'backend/binaries/ytdlp';

const searchYouTubeMusicStep = async (track: Track, onProgress?: OnProgress) => {
  onProgress?.({
    currentTrack: track.track,
    currentTrackTitle: track.title,
    message: `Searching video for ${track.title}`,
    stage: 'search',
  });

  const videoId = await searchYTMusic(track);

  if (!videoId) {
    onProgress?.({
      currentTrack: track.track,
      currentTrackTitle: track.title,
      error: 'No YTMusic videoId found',
    });
    console.log(`ytmusic: no result found for [${track.title}]`);
  }

  return videoId;
};

const ytdlpStep = async ({ isCustomUrl, track, videoId }: { isCustomUrl?: boolean; track: Track; videoId: string }, onProgress?: OnProgress) => {
  onProgress?.({
    currentTrack: track.track,
    currentTrackTitle: track.title,
    message: `Downloading ${track.title}`,
    stage: 'download',
  });
  await runYtdlp({ isCustomUrl, track, videoId });
  if (!track.trackPath) {
    onProgress?.({
      currentTrack: track.track,
      currentTrackTitle: track.title,
      error: 'ytdlp error',
    });
  }
};

export const downloaderService = {
  searchYouTubeMusicStep,
  ytdlpStep,
};
