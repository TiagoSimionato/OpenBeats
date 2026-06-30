import type { LibraryReleaseRecord } from 'common/types/requests/library';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { probeAudioFile } from 'backend/binaries/ffprobe';
import { coverArtService } from 'backend/services/coverArt.service';
import { dbService } from 'backend/services/db.service';
import { isAudioFile, walkFiles } from 'backend/utils';
import { CONFIGS } from 'configs';

const upsertDownloadedRelease = async (record: LibraryReleaseRecord) => {
  dbService.dbExec(`
    INSERT INTO downloaded_releases (
      release_id,
      album,
      album_artist,
      download_path,
      cover_path,
      track_count,
      completed_at
    ) VALUES (
      @releaseId,
      @album,
      @albumArtist,
      @downloadPath,
      @coverPath,
      @trackCount,
      @completedAt
    )
    ON CONFLICT(release_id) DO UPDATE SET
      album = excluded.album,
      album_artist = excluded.album_artist,
      download_path = excluded.download_path,
      cover_path = excluded.cover_path,
      track_count = excluded.track_count,
      completed_at = excluded.completed_at;
  `, record);
};

const listDownloadedReleases = async () => {
  const database = await dbService.getDatabase();
  const rows = database.prepare(`
    SELECT
      release_id AS releaseId,
      album,
      album_artist AS albumArtist,
      download_path AS downloadPath,
      cover_path AS coverPath,
      track_count AS trackCount,
      completed_at AS completedAt
    FROM downloaded_releases
    ORDER BY completed_at DESC;
  `).all();

  return rows as LibraryReleaseRecord[];
};

const getLibraryRelease = async (releaseId: string) => {
  const database = await dbService.getDatabase();
  const row = database.prepare(`
    SELECT
      release_id AS releaseId,
      album,
      album_artist AS albumArtist,
      download_path AS downloadPath,
      cover_path AS coverPath,
      track_count AS trackCount,
      completed_at AS completedAt
    FROM downloaded_releases
    WHERE release_id = ?;
  `).get(releaseId);

  return row as LibraryReleaseRecord | undefined;
};

const scanReleasesFromDisk = async () => {
  const downloadPath = resolve(CONFIGS.DOWNLOAD_PATH);

  if (!existsSync(downloadPath)) {
    return;
  }

  const files = await walkFiles(downloadPath);
  const libraryReleases = new Map<string, LibraryReleaseRecord>();

  for (const filePath of files) {
    if (!isAudioFile(filePath)) {
      continue;
    }

    try {
      const probeResponse = await probeAudioFile(filePath);
      const tags = probeResponse.format?.tags;
      const releaseId = tags?.['MusicBrainz Album Id'];

      if (!releaseId) {
        continue;
      }

      const current = libraryReleases.get(releaseId) ?? {
        album: tags.album ?? '',
        albumArtist: tags.album_artist ?? tags.artist ?? '',
        completedAt: new Date().toISOString(),
        coverPath: await coverArtService.getCoverFilePath(releaseId),
        downloadPath: dirname(filePath),
        releaseId,
        trackCount: 0,
      };

      current.album = current.album || tags.album || '';
      current.albumArtist = current.albumArtist || tags.album_artist || tags.artist || '';
      current.coverPath = current.coverPath || await coverArtService.getCoverFilePath(releaseId);
      current.downloadPath = dirname(filePath);
      current.trackCount += 1;
      libraryReleases.set(releaseId, current);
    }
    catch {
      // Skip unreadable or unsupported files during startup backfill.
    }
  }

  const upsertStatements = [...libraryReleases.values()].map(record => upsertDownloadedRelease(record));
  await Promise.all(upsertStatements);
};

const scanLibraryReleases = async () => {
  await scanReleasesFromDisk();
  return await listDownloadedReleases();
};

export const releasesRepository = {
  getLibraryRelease,
  listDownloadedReleases,
  scanLibraryReleases,
  scanReleasesFromDisk,
  upsertDownloadedRelease,
};
