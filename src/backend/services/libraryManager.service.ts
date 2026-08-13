import type { ReleaseRecord, TrackRequestParams } from 'common/types/requests/library';
import type { ReleaseResponse } from 'common/types/requests/mbApi';
import type { DownloadJobProgress, Track } from 'common/types/requests/releases';
import { existsSync } from 'node:fs';
import { rm, rmdir, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { getCoverFromTrack, writeTrackMetadata } from 'backend/binaries/ffmpeg';
import { probeAudioFile } from 'backend/binaries/ffprobe';
import { runRsgain } from 'backend/binaries/rsgain';
import { runYtdlp, searchYTMusic } from 'backend/binaries/ytdlp';
import { throwError } from 'backend/exceptions/handler';
import { NotFoundError, UnprocessableEntityError } from 'backend/exceptions/http';
import { releasesRepository } from 'backend/repositories/releases.repository';
import { coverArtService } from 'backend/services/coverArt.service';
import { isAudioFile, makeTrackPath, walkFiles } from 'backend/utils';
import { mbApi, MUSICBRAINZ_RELEASE_PARAMS } from 'common/api/mbApi';
import { mapLibraryReleaseToTracks, mapMBResponseToTracks } from 'common/utils';
import { CONFIGS } from 'configs/constants';

type OnProgress = ((progress: Omit<Partial<DownloadJobProgress>, 'jobId'>) => void) | undefined;

const getReleaseMetadataStep = async (releaseId: string, onProgress?: OnProgress) => {
  const release = await mbApi.get<ReleaseResponse>(`release/${releaseId}`, {
    params: MUSICBRAINZ_RELEASE_PARAMS,
  }).catch(() => {
    onProgress?.({
      error: 'Error fetching metadata',
      stage: 'failed',
      status: 'failed',
    });
  });

  if (!release)
    return;

  return {
    release,
    tracks: mapMBResponseToTracks(release),
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

const addTrackstep = async ({ customUrl, file, track }: { customUrl?: string; file?: File; track: Track }, onProgress?: OnProgress) => {
  if (customUrl && !file) {
    console.log(`using custom url: ${customUrl}`);
    await ytdlpStep({ isCustomUrl: true, track, videoId: customUrl }, onProgress);
  }
  if (!customUrl && !!file) {
    track.trackPath = `${await makeTrackPath(track)}${extname(file.name)}`;

    const bytes = await file.arrayBuffer();
    await writeFile(track.trackPath, Buffer.from(bytes));
  }
  if (!customUrl && !file) {
    const videoId = await searchYouTubeMusicStep(track, onProgress);
    if (!videoId) {
      return false;
    }

    await ytdlpStep({ track, videoId }, onProgress);
  }
  return true;
};

const metadataStep = async ({ track }: {
  track: Track;
}, onProgress?: OnProgress) => {
  onProgress?.({
    currentTrack: track.track,
    currentTrackTitle: track.title,
    message: `Tagging ${track.title}`,
    stage: 'metadata',
  });
  await writeTrackMetadata({
    track,
  });
};

const gainStep = async ({ albumDirectoryPath, title }: {
  albumDirectoryPath: string;
  title: string;
}, onProgress?: OnProgress) => {
  onProgress?.({
    currentTrackTitle: title,
    message: `Adding gain tag to ${title}`,
    stage: 'metadata',
  });
  await runRsgain({
    directoryPath: albumDirectoryPath,
    title,
  });
};

const addToLibrary = async (tracks: Track[], onProgress?: OnProgress, customUrl?: string, file?: File) => {
  const coverFilePath = await getCoverArtStep(tracks[0], onProgress);

  tracks[0].coverPath = coverFilePath;
  await releasesRepository.upsertRelease(tracks[0]);

  for (const track of tracks.values()) {
    const isSuccess = await addTrackstep({ customUrl, file, track }, onProgress);
    if (isSuccess) {
      await metadataStep({ track }, onProgress);
      releasesRepository.upsertTrack(track);
    }
  };

  const title = tracks.length === 1 ? tracks[0].title : tracks[0].album;
  const trackPath = tracks.find(it => !!it.trackPath)?.trackPath;

  if (trackPath) {
    await gainStep({
      albumDirectoryPath: dirname(trackPath),
      title,
    });
  }

  onProgress?.({
    currentTrack: tracks[0].Tracktotal,
    message: 'Download completed',
    stage: 'completed',
    status: 'completed',
  });
  console.log(`finished adding ${title} to the library`);
};

const addReleaseToLibrary = async (
  releaseId: string,
  onProgress?: OnProgress,
) => {
  const metadata = await getReleaseMetadataStep(releaseId, onProgress);
  const tracks = metadata?.tracks;
  if (tracks) {
    const libraryRelease = await releasesRepository.getLibraryRelease(releaseId);
    const missingTracks = tracks.filter(it =>
      !(libraryRelease?.tracks.find(libraryTrack => libraryTrack.id === it['MusicBrainz Track Id'])),
    );

    addToLibrary(missingTracks, onProgress);
  }
};

const addTrackToLibrary = async (
  { file, releaseId, trackId, url }: TrackRequestParams & { file?: File },
  onProgress?: OnProgress,
) => {
  const metadata = await getReleaseMetadataStep(releaseId, onProgress);
  const releaseTracks = metadata?.tracks;
  if (releaseTracks) {
    const track = releaseTracks.find(it => it['MusicBrainz Track Id'] === trackId || it['MusicBrainz Release Track Id'] === trackId);

    if (!track) {
      onProgress?.({
        error: 'Release does not contain requested track',
        stage: 'failed',
        status: 'failed',
      });
      return;
    }

    addToLibrary([track], onProgress, url, file);
  }
};

const addReleaseCover = async ({ releaseId }: { releaseId: string }) => {
  const libraryRelease = await releasesRepository.getLibraryRelease(releaseId)
    ?? throwError(new UnprocessableEntityError('Release not found'));

  const existingCoverFilePath = await coverArtService.getCoverFilePath(releaseId);
  if (existingCoverFilePath) {
    await rm(existingCoverFilePath);
  }

  const coverFilePath = await coverArtService.getReleaseCoverArt({ releaseId, title: libraryRelease.album });
  if (coverFilePath) {
    libraryRelease.coverPath = libraryRelease.id;
    releasesRepository.upsertLibraryRelease(libraryRelease);

    const tracks = mapLibraryReleaseToTracks(libraryRelease);
    for (const track of tracks) {
      await metadataStep({ track });
    }

    return;
  }
  throw new UnprocessableEntityError('Could not add release cover');
};

const importReleaseCover = async ({ file, releaseId }: { file: File; releaseId: string }) => {
  const libraryRelease = await releasesRepository.getLibraryRelease(releaseId)
    ?? throwError(new UnprocessableEntityError('Release not found'));

  const existingCoverFilePath = await coverArtService.getCoverFilePath(releaseId);
  if (existingCoverFilePath) {
    await rm(existingCoverFilePath);
  }

  const coverFilePath = join(
    resolve(CONFIGS.COVERS_PATH),
    `${releaseId}${extname(file.name)}`,
  );

  const bytes = await file.arrayBuffer();
  await writeFile(coverFilePath, Buffer.from(bytes));
  await coverArtService.makeWebp(coverFilePath);

  if (!libraryRelease.coverPath) {
    libraryRelease.coverPath = libraryRelease.id;
    releasesRepository.upsertLibraryRelease(libraryRelease);
  }

  const tracks = mapLibraryReleaseToTracks(libraryRelease);
  for (const track of tracks) {
    await metadataStep({ track });
  }
};

const syncReleasesCover = async () => {
  const releases = await releasesRepository.listLibraryReleases();
  for (const release of releases) {
    if (!release.coverPath) {
      const isCoverArtArchiveSuccess = !!(await coverArtService.getReleaseCoverArt({ releaseId: release.id, title: release.album }));
      let isFFMPEGSuccess = false;

      for (const track of release.tracks) {
        if (isCoverArtArchiveSuccess || isFFMPEGSuccess)
          continue;
        isFFMPEGSuccess = !!(await getCoverFromTrack({ filePath: track.downloadPath, releaseId: release.id, title: release.album }));
      }

      const isSuccess = isCoverArtArchiveSuccess || isFFMPEGSuccess;
      if (isSuccess) {
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
      const disc = Number((discParts.length > 1 ? discParts[0] : tags.disc) ?? 1);
      const discTotal = Number((discParts.length > 1 ? discParts[1] : (tags.Disctotal ?? tags.DISCTOTAL)) ?? 1);

      const trackParts = tags.track?.split('/') ?? [];
      const track = Number((trackParts.length > 1 ? trackParts[0] : tags.track) ?? 1);
      const trackTotal = Number((trackParts.length > 1 ? trackParts[1] : (tags.Tracktotal ?? tags.TOTALTRACKS ?? tags.TRACKTOTAL)) ?? 1);

      if (!libraryReleases.get(releaseId)) {
        const currentRelease = {
          album: tags.album ?? tags.ALBUM ?? '',
          albumArtist: tags.album_artist ?? tags.artist ?? '',
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
          releaseType: (tags['MusicBrainz Album Type'] ?? tags.RELEASETYPE)?.split(';')[0] ?? '',
          tmed: tags.TMED ?? tags.MEDIA,
          trackCount: trackTotal,
        };
        libraryReleases.set(releaseId, currentRelease);
        await releasesRepository.upsertLibraryRelease(currentRelease);
      }

      const currentTrack = {
        artist: tags.artist ?? tags.ARTIST ?? tags.ARTISTS,
        artistSort: tags['artist-sort'] ?? tags.ARTISTSORT,
        disc,
        downloadPath: filePath,
        genre: tags.genre ?? tags.GENRE ?? '',
        id: trackId,
        musicBrainzReleaseTrackId: tags['MusicBrainz Release Track Id'] ?? tags.MUSICBRAINZ_RELEASETRACKID ?? '',
        musicBrainzTrackId: tags?.['MusicBrainz Track Id'] ?? tags?.MUSICBRAINZ_TRACKID ?? '',
        releaseId,
        title: tags.title ?? tags.TITLE ?? '',
        trackNumber: track,
        ts02: tags.TSO2,
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
  addReleaseCover,
  addReleaseToLibrary,
  addTrackToLibrary,
  deleteRelease,
  deleteTrack,
  importReleaseCover,
  scanLibraryReleases,
  scanReleasesFromDisk,
  syncReleasesCover,
};
