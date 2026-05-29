import type { DownloadedReleaseRecord } from './types';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import Database from 'better-sqlite3';
import { CONFIGS } from 'configs';

const execFileAsync = promisify(execFile);
const AUDIO_FILE_EXTENSIONS = new Set([
  '.aac',
  '.flac',
  '.m4a',
  '.mp3',
  '.ogg',
  '.opus',
  '.wav',
]);

type ProbeTags = {
  'album'?: string;
  'album_artist'?: string;
  'artist'?: string;
  'MusicBrainz Album Artist Id'?: string;
  'MusicBrainz Album Id'?: string;
};

type ProbeResponse = {
  format?: {
    tags?: ProbeTags;
  };
};

let databasePromise: null | Promise<Database.Database> = null;
let startupScanPromise: null | Promise<void> = null;

const getDatabasePath = () => join(CONFIGS.CACHE_PATH, 'downloads.sqlite');

const getCoverPathForRelease = (releaseId: string) => {
  const coverDir = resolve(CONFIGS.COVERS_PATH);

  if (!existsSync(coverDir)) {
    return undefined;
  }

  const candidates = ['.jpg', '.jpeg', '.png', '.webp'];

  for (const extension of candidates) {
    const candidate = join(coverDir, `${releaseId}${extension}`);

    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
};

const getDatabase = async () => {
  if (!databasePromise) {
    databasePromise = (async () => {
      await mkdir(CONFIGS.CACHE_PATH, { recursive: true });

      const database = new Database(getDatabasePath());

      database.exec(`
        CREATE TABLE IF NOT EXISTS downloaded_releases (
          release_id TEXT PRIMARY KEY,
          album TEXT NOT NULL,
          album_artist TEXT NOT NULL,
          download_path TEXT NOT NULL,
          cover_path TEXT,
          track_count INTEGER NOT NULL,
          completed_at TEXT NOT NULL
        );
      `);

      return database;
    })();
  }

  return databasePromise;
};

const probeAudioFile = async (filePath: string) => {
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

const isAudioFile = (filePath: string) => AUDIO_FILE_EXTENSIONS.has(extname(filePath).toLowerCase());

const walkFiles = async (directoryPath: string): Promise<string[]> => {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const filePaths: string[] = [];

  for (const entry of entries) {
    const entryPath = join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      filePaths.push(...await walkFiles(entryPath));
      continue;
    }

    if (entry.isFile()) {
      filePaths.push(entryPath);
    }
  }

  return filePaths;
};

export const upsertDownloadedRelease = async (record: DownloadedReleaseRecord) => {
  const database = await getDatabase();

  database.prepare(`
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
  `).run(record);
};

export const listDownloadedReleases = async () => {
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

  return rows as DownloadedReleaseRecord[];
};

export const getDownloadedRelease = async (releaseId: string) => {
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

  return row as DownloadedReleaseRecord | undefined;
};

export const scanDownloadedReleasesFromDisk = async () => {
  const downloadPath = resolve(CONFIGS.DOWNLOAD_PATH);

  if (!existsSync(downloadPath)) {
    return;
  }

  const files = await walkFiles(downloadPath);
  const releaseBuckets = new Map<string, {
    album: string;
    albumArtist: string;
    completedAt: string;
    coverPath?: string;
    downloadPath: string;
    releaseId: string;
    trackCount: number;
  }>();

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

      const current = releaseBuckets.get(releaseId) ?? {
        album: tags.album ?? '',
        albumArtist: tags.album_artist ?? tags.artist ?? '',
        completedAt: new Date().toISOString(),
        coverPath: getCoverPathForRelease(releaseId),
        downloadPath: dirname(filePath),
        releaseId,
        trackCount: 0,
      };

      current.album = current.album || tags.album || '';
      current.albumArtist = current.albumArtist || tags.album_artist || tags.artist || '';
      current.coverPath = current.coverPath || getCoverPathForRelease(releaseId);
      current.downloadPath = dirname(filePath);
      current.trackCount += 1;
      releaseBuckets.set(releaseId, current);
    }
    catch {
      // Skip unreadable or unsupported files during startup backfill.
    }
  }

  const upsertStatements = [...releaseBuckets.values()].map(record => upsertDownloadedRelease(record));
  await Promise.all(upsertStatements);
};

export const ensureDownloadIndexReady = async () => {
  if (!startupScanPromise) {
    startupScanPromise = scanDownloadedReleasesFromDisk();
  }

  return startupScanPromise;
};
