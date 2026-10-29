import type { ReleaseResponse } from 'common/types/requests/mbApi';
import type { Track } from 'common/types/requests/releases';
import type { OnProgress } from '.';
import { runFfmpeg } from 'backend/binaries/ffmpeg';
import { retryPromise } from 'backend/utils';
import { mbApi, MUSICBRAINZ_RELEASE_PARAMS } from 'common/api/mbApi';
import { mapMBResponseToTracks } from 'common/utils';

const fetchReleaseMetadata = async (releaseId: string, onProgress?: OnProgress) => {
  const getReleaseMetadata = retryPromise(
    () => mbApi.get<ReleaseResponse>(`release/${releaseId}`, { params: MUSICBRAINZ_RELEASE_PARAMS }),
  );
  const release = await getReleaseMetadata(null);

  if (!release) {
    return onProgress?.({
      error: 'Error fetching metadata',
      stage: 'failed',
      status: 'failed',
    });
  }

  const tracks = mapMBResponseToTracks(release);
  onProgress?.({ artist: tracks[0].album_artist });

  return {
    release,
    tracks,
  };
};

const writeTrackMetadata = async ({ track }: {
  track: Track;
}, onProgress?: OnProgress) => {
  onProgress?.({
    currentTrack: track.track,
    currentTrackTitle: track.title,
    message: `Tagging ${track.title}`,
    stage: 'metadata',
  });
  await runFfmpeg({
    track,
  });
};

export const metadataService = {
  fetchReleaseMetadata,
  writeTrackMetadata,
};
