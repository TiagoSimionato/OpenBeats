import type { LibraryReleaseRecord } from 'common/types/requests/library';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { probeAudioFile } from 'backend/binaries/ffprobe';
import { coverArtService } from 'backend/services/coverArt.service';
import { isAudioFile, walkFiles } from 'backend/utils';
import Database from 'better-sqlite3';
import { CONFIGS } from 'configs';

let databaseInstance: Database.Database | null = null;

const getDatabase = async () => {
  if (databaseInstance !== null)
    return databaseInstance;

  await mkdir(CONFIGS.CACHE_PATH, { recursive: true });

  const database = new Database(CONFIGS.DB_PATH);
  databaseInstance = database;

  database.exec(`
    CREATE TABLE IF NOT EXISTS downloaded_releases (
      release_id TEXT PRIMARY KEY,
      album TEXT NOT NULL,
      album_artist TEXT NOT NULL,
      download_path TEXT NOT NULL,
      cover_path TEXT,
      track_count INTEGER NOT NULL,
      completed_at TEXT NOT NULL
    );`);

  return database;
};

const resetDatabase = async () => {
  databaseInstance?.close();
  databaseInstance = null;
  await getDatabase();
};

const dbExec = async (statement: string, obj: unknown) => {
  const execStatement = async () => {
    const database = await getDatabase();

    database.prepare(statement).run(obj);
  };

  try {
    await execStatement();
  }
  catch (error) {
    if ((error as { code?: string }).code !== 'SQLITE_READONLY_DBMOVED') {
      throw error;
    }

    await resetDatabase();
    await execStatement();
  }
};

const upsertDownloadedRelease = async (record: LibraryReleaseRecord) => {
  dbExec(`
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
  const database = await getDatabase();
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
  const database = await getDatabase();
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

export const dbService = {
  getDatabase,
  getLibraryRelease,
  listDownloadedReleases,
  scanLibraryReleases,
  scanReleasesFromDisk,
  upsertDownloadedRelease,
};
