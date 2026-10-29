import type { ReleaseRecord } from 'common/types/requests/library';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { probeAudioFile } from 'backend/binaries/ffprobe';
import { releasesRepository } from 'backend/repositories/releases.repository';
import { isAudioFile, walkFiles } from 'backend/utils';
import { CONFIGS } from 'configs/constants';
import { libraryManagerService } from '.';
import { coverArtService } from '../coverArt.service';

const scanLibrary = async () => {
  console.log('Started Library Scan');
  const downloadPath = resolve(CONFIGS.DOWNLOAD_PATH);

  if (!existsSync(downloadPath)) {
    return;
  }

  const files = await walkFiles(downloadPath);
  const libraryReleases = new Map<string, ReleaseRecord>();

  let progress = 0;

  for (const filePath of files) {
    if (progress % 100 === 0) {
      console.log(`Scan progress ${progress}/${files.length}`);
    }
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
    progress++;
  }

  await libraryManagerService.covers.syncReleasesCover();
  console.log('Finished Library Scan');
};

export const scannerService = {
  scanLibrary,
};
