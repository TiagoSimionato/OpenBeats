import type { LibraryReleaseData, ReleaseRecord, TrackRecord } from 'common/types/requests/library';
import type { Track } from 'common/types/requests/releases';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { probeAudioFile } from 'backend/binaries/ffprobe';
import { dbService } from 'backend/services/db.service';
import { isAudioFile, walkFiles } from 'backend/utils';
import { CONFIGS } from 'configs/constants';

const createDDL = async () => {
  const database = await dbService.getDatabase();

  database.exec(`
    CREATE TABLE IF NOT EXISTS tb_releases (
      id UUID PRIMARY KEY,
      album TEXT NOT NULL,
      album_artist TEXT NOT NULL,
      release_type TEXT NOT NULL,
      release_date TEXT,
      track_count INTEGER NOT NULL,
      cover_path TEXT,
      completed_at TEXT NOT NULL
    );`);
  database.exec(`
    CREATE TABLE IF NOT EXISTS tb_tracks (
      id UUID PRIMARY KEY,
      release_id UUID NOT NULL REFERENCES tb_releases(id),
      title TEXT NOT NULL,
      download_path TEXT NOT NULL,
      track_number INTEGER NOT NULL,
      completed_at TEXT NOT NULL
    );`);
};

const upsertLibraryRelease = async (record: ReleaseRecord) => {
  dbService.dbExec(`
    INSERT INTO tb_releases (
      id,
      album,
      album_artist,
      release_type,
      release_date,
      track_count,
      cover_path,
      completed_at
    ) VALUES (
      @id,
      @album,
      @albumArtist,
      @releaseType,
      @releaseDate,
      @trackCount,
      @coverPath,
      @completedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      album = excluded.album,
      album_artist = excluded.album_artist,
      release_type = excluded.release_type,
      release_date = excluded.release_date,
      track_count = excluded.track_count,
      cover_path = excluded.cover_path,
      completed_at = excluded.completed_at;
  `, record);
};

const upsertLibraryTrack = async (record: TrackRecord) => {
  dbService.dbExec(`
    INSERT INTO tb_tracks (
      id,
      release_id,
      title,
      download_path,
      track_number,
      completed_at
    ) VALUES (
      @id,
      @releaseId,
      @title,
      @downloadPath,
      @trackNumber,
      @completedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      release_id = excluded.release_id,
      title = excluded.title,
      download_path = excluded.download_path,
      track_number = excluded.track_number,
      completed_at = excluded.completed_at;
  `, record);
};

const upsertRelease = (track: Track) => {
  upsertLibraryRelease({
    album: track.album,
    albumArtist: track.artist,
    completedAt: new Date().toISOString(),
    coverPath: track.coverPath ? track['MusicBrainz Album Id'] : undefined,
    id: track['MusicBrainz Album Id'],
    releaseDate: track.date,
    releaseType: track['MusicBrainz Album Type'],
    trackCount: track.Tracktotal,
  });
};

const SELECT_LIBRARY_RELEASE = `
  SELECT
    r.id                                AS id,
    r.album,
    r.album_artist                      AS albumArtist,
    r.release_type                      AS releaseType,
    r.release_date                      AS releaseDate,
    r.track_count                       AS trackCount,
    r.cover_path                        AS coverPath,
    r.completed_at                      AS completedAt,
    json_group_array(
      json_object(
        'id',           t.id,
        'title',        t.title,
        'downloadPath', t.download_path,
        'trackNumber',  t.track_number,
        'completedAt',  t.completed_at
      )
    )                                   AS tracks
  FROM tb_releases r
  JOIN tb_tracks t on t.release_id = r.id
`;

const listDownloadedReleases = async () => {
  const database = await dbService.getDatabase();
  const rows = database.prepare(`
    ${SELECT_LIBRARY_RELEASE}
    GROUP BY r.id
    ORDER BY r.completed_at DESC;
  `).all() as any[];

  return rows.map(row => ({
    ...row,
    tracks: JSON.parse(row.tracks),
  })) as LibraryReleaseData[];
};

const getLibraryRelease = async (releaseId: string) => {
  const database = await dbService.getDatabase();
  const row = database.prepare(`
    ${SELECT_LIBRARY_RELEASE}
    WHERE r.id = ?;
  `).get(releaseId) as any;

  if (row) {
    return {
      ...row,
      tracks: JSON.parse(row.tracks),
    } as LibraryReleaseData | undefined;
  }
};

const scanReleasesFromDisk = async () => {
  const downloadPath = resolve(CONFIGS.DOWNLOAD_PATH);

  if (!existsSync(downloadPath)) {
    return;
  }

  const files = await walkFiles(downloadPath);
  const libraryReleases = new Map<string, ReleaseRecord>();
  const libraryTracks = new Map<string, TrackRecord>();

  for (const filePath of files) {
    if (!isAudioFile(filePath)) {
      continue;
    }

    try {
      const probeResponse = await probeAudioFile(filePath);
      const tags = probeResponse.format?.tags;
      const releaseId = tags?.['MusicBrainz Album Id'];
      const trackId = tags?.['MusicBrainz Track Id'];

      if (!releaseId || !trackId) {
        continue;
      }

      const currentRelease = libraryReleases.get(releaseId) ?? {
        album: tags.album ?? '',
        albumArtist: tags.album_artist ?? tags.artist ?? '',
        completedAt: new Date().toISOString(),
        coverPath: existsSync(`${CONFIGS.COVERS_PATH}/${releaseId}.jpg`) ? releaseId : undefined,
        id: releaseId,
        releaseDate: tags.date,
        releaseType: tags['MusicBrainz Album Type'] ?? '',
        trackCount: Number(tags.Tracktotal),
      };

      const currentTrack = libraryTracks.get(trackId) ?? {
        completedAt: new Date().toISOString(),
        downloadPath: filePath,
        id: trackId,
        releaseId,
        title: tags.title ?? '',
        trackNumber: Number(tags.track),
      };

      libraryReleases.set(releaseId, currentRelease);
      libraryTracks.set(trackId, currentTrack);
    }
    catch (error) {
      console.warn(`walk files error: ${error}`);
    }
  }

  const upsertReleasesStatements = [
    ...libraryReleases.values(),
  ].map(releaseRecord => upsertLibraryRelease(releaseRecord));
  await Promise.all(upsertReleasesStatements);

  const upsertTracksStatements = [
    ...libraryTracks.values(),
  ].map(trackRecord => upsertLibraryTrack(trackRecord));
  await Promise.all(upsertTracksStatements);
};

const scanLibraryReleases = async () => {
  await scanReleasesFromDisk();
  return await listDownloadedReleases();
};

export const releasesRepository = {
  createDDL,
  getLibraryRelease,
  listDownloadedReleases,
  scanLibraryReleases,
  scanReleasesFromDisk,
  upsertLibraryTrack,
  upsertRelease,
};
