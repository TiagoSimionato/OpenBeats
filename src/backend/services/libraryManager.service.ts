import type { ReleaseRecord, TrackRequestParams } from 'common/types/requests/library';
import type { ReleaseResponse } from 'common/types/requests/mbApi';
import type { DownloadJobProgress, Track } from 'common/types/requests/releases';
import { existsSync } from 'node:fs';
import { rm, rmdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { writeTrackMetadata } from 'backend/binaries/ffmpeg';
import { probeAudioFile } from 'backend/binaries/ffprobe';
import { runYtdlp, searchYouTubeMusic } from 'backend/binaries/ytdlp';
import { NotFoundError } from 'backend/exceptions/http';
import { releasesRepository } from 'backend/repositories/releases.repository';
import { coverArtService } from 'backend/services/coverArt.service';
import { isAudioFile, walkFiles } from 'backend/utils';
import { mbApi, MUSICBRAINZ_RELEASE_PARAMS } from 'common/api/mbApi';
import { mapReleaseTracksToDownloadTracks } from 'common/utils';
import { CONFIGS } from 'configs/constants';

type OnProgress = ((progress: Omit<Partial<DownloadJobProgress>, 'jobId'>) => void) | undefined;

const getReleaseMetadataStep = async (releaseId: string) => {
  const release = await mbApi.get<ReleaseResponse>(`release/${releaseId}`, {
    params: MUSICBRAINZ_RELEASE_PARAMS,
  });

  return {
    release,
    tracks: mapReleaseTracksToDownloadTracks(release),
  };
};

const getCoverArtStep = async (track: Track, onProgress?: OnProgress): Promise<string | undefined> => {
  onProgress?.({
    message: 'Downloading cover art',
    stage: 'cover',
  });

  const coverFilePath = await coverArtService.getReleaseCoverArt({ releaseId: track['MusicBrainz Album Id'], title: track.album });

  return coverFilePath;
};

const searchYouTubeMusicStep = async (track: Track, onProgress?: OnProgress) => {
  onProgress?.({
    currentTrack: track.track,
    currentTrackTitle: track.title,
    message: `Searching video for ${track.title}`,
    stage: 'search',
  });

  const videoId = await searchYouTubeMusic(track);
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
  const trackPath = await runYtdlp({ isCustomUrl, track, videoId });
  track.trackPath = trackPath;
  if (!trackPath) {
    onProgress?.({
      currentTrack: track.track,
      currentTrackTitle: track.title,
      error: 'ytdlp error',
    });
  }
  return trackPath;
};

const metadataStep = async ({ coverFilePath, filePath, track }: {
  coverFilePath?: string;
  filePath: string;
  track: Track;
}, onProgress?: OnProgress) => {
  onProgress?.({
    currentTrack: track.track,
    currentTrackTitle: track.title,
    message: `Tagging ${track.title}`,
    stage: 'metadata',
  });
  await writeTrackMetadata({
    coverFilePath,
    filePath,
    track,
  });
};

const addToLibrary = async (tracks: Track[], onProgress?: OnProgress, customUrl?: string) => {
  const coverFilePath = await getCoverArtStep(tracks[0], onProgress);

  tracks[0].coverPath = coverFilePath;
  releasesRepository.upsertRelease(tracks[0]);

  for (const track of tracks.values()) {
    track.coverPath = coverFilePath;

    let trackPath;
    if (!customUrl) {
      const videoId = await searchYouTubeMusicStep(track, onProgress);
      if (!videoId) {
        continue;
      }

      trackPath = await ytdlpStep({ track, videoId }, onProgress);
    }
    if (customUrl) {
      console.log(`using custom url: ${customUrl}`);
      trackPath = await ytdlpStep({ isCustomUrl: true, track, videoId: customUrl }, onProgress);
    }
    if (!trackPath) {
      continue;
    }

    await metadataStep({ coverFilePath, filePath: trackPath, track }, onProgress);

    await releasesRepository.upsertLibraryTrack({
      disc: track.disc,
      downloadPath: trackPath,
      genre: track.genre.join('; '),
      id: track['MusicBrainz Track Id'],
      musicBrainzReleaseTrackId: track['MusicBrainz Release Track Id'],
      musicBrainzTrackId: track['MusicBrainz Track Id'],
      releaseId: track['MusicBrainz Album Id'],
      title: track.title,
      trackNumber: track.track,
    });
  };

  onProgress?.({
    currentTrack: tracks[0].Tracktotal,
    message: 'Download completed',
    stage: 'completed',
    status: 'completed',
  });
  console.log(`finished adding ${tracks.length === 1 ? tracks[0].title : tracks[0].album} to the library`);
};

const addReleaseToLibrary = async (
  releaseId: string,
  onProgress?: OnProgress,
) => {
  const { tracks } = await getReleaseMetadataStep(releaseId);

  const libraryRelease = await releasesRepository.getLibraryRelease(releaseId);
  const missingTracks = tracks.filter(it =>
    !(libraryRelease?.tracks.find(libraryTrack => libraryTrack.id === it['MusicBrainz Track Id'])),
  );

  addToLibrary(missingTracks, onProgress);
};

const addTrackToLibrary = async (
  { releaseId, trackId, url }: TrackRequestParams,
  onProgress?: OnProgress,
) => {
  const { tracks: releaseTracks } = await getReleaseMetadataStep(releaseId);

  const track = releaseTracks.find(it => it['MusicBrainz Track Id'] === trackId || it['MusicBrainz Release Track Id'] === trackId);

  if (!track) {
    onProgress?.({
      error: 'Release does not contain requested track',
      stage: 'failed',
      status: 'failed',
    });
    return;
  }

  addToLibrary([track], onProgress, url);
};

const syncReleasesCover = async () => {
  const releases = await releasesRepository.listLibraryReleases();
  for (const release of releases) {
    if (!release.coverPath) {
      if (await coverArtService.getReleaseCoverArt({ releaseId: release.id, title: release.album })) {
        releasesRepository.upsertLibraryRelease({
          ...release,
          coverPath: release.id,
        });
      }
    }
  }
};

const scanReleasesFromDisk = async () => {
  const downloadPath = resolve(CONFIGS.DOWNLOAD_PATH);

  if (!existsSync(downloadPath)) {
    return;
  }

  const files = await walkFiles(downloadPath);
  const libraryReleases = new Map<string, ReleaseRecord>();

  for (const filePath of files) {
    if (!isAudioFile(filePath)) {
      continue;
    }

    try {
      const probeResponse = await probeAudioFile(filePath);
      const tags = probeResponse.format?.tags;
      const releaseId = tags?.['MusicBrainz Album Id'] ?? tags?.MUSICBRAINZ_ALBUMID;
      const trackId = tags?.['MusicBrainz Track Id'] ?? tags?.MUSICBRAINZ_TRACKID ?? tags?.['MusicBrainz Release Track Id'] ?? tags?.MUSICBRAINZ_RELEASETRACKID;

      if (!releaseId || !trackId || !tags) {
        continue;
      }

      const discParts = tags.disc?.split('/') ?? [];
      const disc = Number((discParts?.length > 1 ? discParts?.[0] : tags.disc) ?? 1);
      const discTotal = Number((discParts?.length > 1 ? discParts?.[1] : tags.Disctotal ?? tags.DISCTOTAL) ?? 1);

      const trackParts = tags.track?.split('/');
      const track = Number((trackParts?.length ?? 0 > 1 ? trackParts?.[0] : tags.track) ?? 1);
      const trackTotal = Number((trackParts?.length ?? 0 > 1 ? trackParts?.[1] : tags.Tracktotal ?? tags.TOTALTRACKS ?? tags.TRACKTOTAL) ?? 1);

      if (!libraryReleases.get(releaseId)) {
        const currentRelease = {
          album: tags.album ?? tags.ALBUM ?? '',
          albumArtist: tags.album_artist ?? tags.artist ?? '',
          artist: tags.artist ?? tags.ARTIST ?? tags.ARTISTS,
          artistSort: tags['artist-sort'] ?? tags.ARTISTSORT,
          coverPath: existsSync(await coverArtService.getCoverFilePath(releaseId) ?? '') ? releaseId : undefined,
          discTotal,
          id: releaseId,
          musicBrainzAlbumArtistId: tags['MusicBrainz Album Artist Id'] ?? tags.MUSICBRAINZ_ALBUMARTISTID ?? '',
          musicBrainzAlbumId: releaseId,
          musicBrainzAlbumReleaseCountry: tags['MusicBrainz Album Release Country'] ?? tags.RELEASECOUNTRY,
          musicBrainzAlbumStatus: tags['MusicBrainz Album Status'] ?? tags.RELEASESTATUS,
          musicBrainzArtistId: tags['MusicBrainz Artist Id'] ?? tags.MUSICBRAINZ_ARTISTID ?? '',
          musicBrainzReleaseGroupId: tags['MusicBrainz Release Group Id'] ?? tags.MUSICBRAINZ_RELEASEGROUPID ?? '',
          originalYear: Number(tags.originalyear ?? tags.ORIGINALYEAR ?? 0),
          publisher: tags.publisher ?? tags.LABEL,
          releaseDate: tags.ORIGINALDATE ?? tags.date ?? tags.DATE,
          releaseType: tags['MusicBrainz Album Type'] ?? tags.RELEASETYPE ?? '',
          tmed: tags.TMED ?? tags.MEDIA,
          trackCount: trackTotal,
          ts02: tags.TSO2,
        };
        libraryReleases.set(releaseId, currentRelease);
        await releasesRepository.upsertLibraryRelease(currentRelease);
      }

      const currentTrack = {
        disc,
        downloadPath: filePath,
        genre: tags.genre ?? tags.GENRE ?? '',
        id: trackId,
        musicBrainzReleaseTrackId: tags['MusicBrainz Release Track Id'] ?? tags.MUSICBRAINZ_RELEASETRACKID ?? '',
        musicBrainzTrackId: tags?.['MusicBrainz Track Id'] ?? tags?.MUSICBRAINZ_TRACKID ?? '',
        releaseId,
        title: tags.title ?? tags.TITLE ?? '',
        trackNumber: track,
      };
      await releasesRepository.upsertLibraryTrack(currentTrack);
    }
    catch (error) {
      console.warn(`walk files error: ${error}`);
    }
  }

  await syncReleasesCover();
};

const scanLibraryReleases = async () => {
  await scanReleasesFromDisk();
  return await releasesRepository.listLibraryReleases();
};

const deleteRelease = async (releaseId: string) => {
  const release = await releasesRepository.getLibraryRelease(releaseId);

  if (!release)
    throw new NotFoundError('Release not found');

  let releaseDirectory: string = '';
  for (const track of release.tracks) {
    if (!releaseDirectory)
      releaseDirectory = dirname(track.downloadPath);

    await rm(track.downloadPath).catch(() => {});
  };
  if (releaseDirectory) {
    await rmdir(releaseDirectory).catch(() => {});
    const artistDirectory = dirname(`${releaseDirectory}.xpto`);
    await rmdir(artistDirectory).catch(() => {});
  }
  const coverPath = await coverArtService.getCoverFilePath(release.id);
  if (coverPath) {
    await rm(coverPath).catch(() => {});
  }
  await rm(`${CONFIGS.THUMBNAILS_PATH}/${release.id}.webp`).catch(() => {});

  releasesRepository.deleteRelease(releaseId);
};

const deleteTrack = async ({ releaseId, trackId }: TrackRequestParams) => {
  const release = await releasesRepository.getLibraryRelease(releaseId);

  if (!release)
    throw new NotFoundError('Release not found');

  if (release.tracks.length === 1) {
    deleteRelease(releaseId);
    return;
  }

  const track = release.tracks.find(it => it.id === trackId);

  if (track?.downloadPath) {
    await rm(track.downloadPath).catch(() => {});
  }

  releasesRepository.deleteTrack(trackId);
};

export const libraryManagerService = {
  addReleaseToLibrary,
  addTrackToLibrary,
  deleteRelease,
  deleteTrack,
  scanLibraryReleases,
  scanReleasesFromDisk,
  syncReleasesCover,
};
