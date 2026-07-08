import type { LibraryReleaseData, ReleaseRecord, TrackRecord } from 'common/types/requests/library';
import type { Track } from 'common/types/requests/releases';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { probeAudioFile } from 'backend/binaries/ffprobe';
import { coverArtService } from 'backend/services/coverArt.service';
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
      artist TEXT,
      artist_sort TEXT,
      release_type TEXT NOT NULL,
      release_date TEXT,
      original_year INTEGER,
      genre TEXT,
      publisher TEXT,
      track_count INTEGER NOT NULL,
      disc INTEGER,
      disc_total INTEGER,
      tmed TEXT,
      ts02 TEXT,
      music_brainz_album_release_country TEXT,
      music_brainz_album_status TEXT,
      music_brainz_album_artist_id UUID NOT NULL,
      music_brainz_album_id UUID NOT NULL,
      music_brainz_artist_id UUID NOT NULL,
      music_brainz_release_group_id UUID NOT NULL,
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
      music_brainz_release_track_id UUID NOT NULL,
      music_brainz_track_id UUID NOT NULL,
      completed_at TEXT NOT NULL
    );`);
};

const upsertLibraryRelease = async (record: ReleaseRecord) => {
  dbService.dbExec(`
    INSERT INTO tb_releases (
      id,
      album,
      album_artist,
      artist,
      artist_sort,
      release_type,
      release_date,
      original_year,
      genre,
      publisher,
      track_count,
      disc,
      disc_total,
      tmed,
      ts02,
      music_brainz_album_release_country,
      music_brainz_album_status,
      music_brainz_album_artist_id,
      music_brainz_album_id,
      music_brainz_artist_id,
      music_brainz_release_group_id,
      cover_path,
      completed_at
    ) VALUES (
      @id,
      @album,
      @albumArtist,
      @artist,
      @artistSort,
      @releaseType,
      @releaseDate,
      @originalYear,
      @genre,
      @publisher,
      @trackCount,
      @disc,
      @discTotal,
      @tmed,
      @ts02,
      @musicBrainzAlbumReleaseCountry,
      @musicBrainzAlbumStatus,
      @musicBrainzAlbumArtistId,
      @musicBrainzAlbumId,
      @musicBrainzArtistId,
      @musicBrainzReleaseGroupId,
      @coverPath,
      @completedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      album = excluded.album,
      album_artist = excluded.album_artist,
      artist = excluded.artist,
      artist_sort = excluded.artist_sort,
      release_type = excluded.release_type,
      release_date = excluded.release_date,
      original_year = excluded.original_year,
      genre = excluded.genre,
      publisher = excluded.publisher,
      track_count = excluded.track_count,
      disc = excluded.disc,
      disc_total = excluded.disc_total,
      tmed = excluded.tmed,
      ts02 = excluded.ts02,
      music_brainz_album_release_country = excluded.music_brainz_album_release_country,
      music_brainz_album_status = excluded.music_brainz_album_status,
      music_brainz_album_artist_id = excluded.music_brainz_album_artist_id,
      music_brainz_album_id = excluded.music_brainz_album_id,
      music_brainz_artist_id = excluded.music_brainz_artist_id,
      music_brainz_release_group_id = excluded.music_brainz_release_group_id,
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
      music_brainz_release_track_id,
      music_brainz_track_id,
      completed_at
    ) VALUES (
      @id,
      @releaseId,
      @title,
      @downloadPath,
      @trackNumber,
      @musicBrainzReleaseTrackId,
      @musicBrainzTrackId,
      @completedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      release_id = excluded.release_id,
      title = excluded.title,
      download_path = excluded.download_path,
      track_number = excluded.track_number,
      music_brainz_release_track_id = excluded.music_brainz_release_track_id,
      music_brainz_track_id = excluded.music_brainz_track_id,
      completed_at = excluded.completed_at;
  `, record);
};

const upsertRelease = (track: Track) => {
  upsertLibraryRelease({
    album: track.album,
    albumArtist: track.artist,
    artist: track.artist,
    artistSort: track['artist-sort'],
    completedAt: new Date().toISOString(),
    coverPath: track.coverPath ? track['MusicBrainz Album Id'] : undefined,
    disc: track.disc,
    discTotal: track.Disctotal,
    genre: track.genre.join(', '),
    id: track['MusicBrainz Album Id'],
    musicBrainzAlbumArtistId: track['MusicBrainz Album Artist Id'],
    musicBrainzAlbumId: track['MusicBrainz Album Id'],
    musicBrainzAlbumReleaseCountry: track['MusicBrainz Album Release Country'],
    musicBrainzAlbumStatus: track['MusicBrainz Album Status'],
    musicBrainzArtistId: track['MusicBrainz Artist Id'],
    musicBrainzReleaseGroupId: track['MusicBrainz Release Group Id'],
    originalYear: track.originalyear,
    publisher: track.publisher,
    releaseDate: track.date,
    releaseType: track['MusicBrainz Album Type'],
    trackCount: track.Tracktotal,
  });
};

const SELECT_LIBRARY_RELEASE = `
  SELECT
    r.id                                 AS id,
    r.album,
    r.album_artist                       AS albumArtist,
    r.release_type                       AS releaseType,
    r.release_date                       AS releaseDate,
    r.original_year                      AS originalYear,
    r.genre,
    r.publisher,
    r.track_count                        AS trackCount,
    r.disc,
    r.disc_total                         AS discTotal,
    r.tmed,
    r.ts02,
    r.music_brainz_album_release_country AS musicBrainzAlbumReleaseCountry,
    r.music_brainz_album_status          AS musicBrainzAlbumStatus,
    r.music_brainz_album_artist_id       AS musicBrainzAlbumArtistId,
    r.music_brainz_album_id              AS musicBrainzAlbumId,
    r.music_brainz_artist_id             AS musicbrainzArtistId,
    r.music_brainz_release_group_id      AS musicbrainzReleaseGroupId,
    r.cover_path                         AS coverPath,
    r.completed_at                       AS completedAt,
    json_group_array(
      json_object(
        'id',                        t.id,
        'title',                     t.title,
        'downloadPath',              t.download_path,
        'trackNumber',               t.track_number,
        'musicBrainzReleaseTrackId', t.music_brainz_release_track_id,
        'musicBrainzTrackId',        t.music_brainz_track_id,
        'completedAt',               t.completed_at
      )
    )                                    AS tracks
  FROM tb_releases r
  JOIN tb_tracks t on t.release_id = r.id
`;

const listDownloadedReleases = async () => {
  const rows = await dbService.list<LibraryReleaseData>(`
    ${SELECT_LIBRARY_RELEASE}
    GROUP BY r.id
    ORDER BY r.completed_at DESC;
  `);

  return rows.map(row => ({
    ...row,
    tracks: JSON.parse(row.tracks as unknown as string) as TrackRecord[],
  }));
};

const getLibraryRelease = async (releaseId: string) => {
  const row = await dbService.get<LibraryReleaseData>(`
    ${SELECT_LIBRARY_RELEASE}
    WHERE r.id = ?;
  `, [releaseId]);

  if (row) {
    return {
      ...row,
      tracks: JSON.parse(row.tracks as unknown as string) as TrackRecord[],
    };
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
        artist: tags.artist,
        artistSort: tags['artist-sort'],
        completedAt: new Date().toISOString(),
        coverPath: existsSync(await coverArtService.getCoverFilePath(releaseId) ?? '') ? releaseId : undefined,
        disc: Number(tags.disc),
        discTotal: Number(tags.Disctotal),
        genre: tags.genre ?? '',
        id: releaseId,
        musicBrainzAlbumArtistId: tags['MusicBrainz Album Artist Id'] ?? '',
        musicBrainzAlbumId: tags['MusicBrainz Album Id'] ?? '',
        musicBrainzAlbumReleaseCountry: tags['MusicBrainz Album Release Country'],
        musicBrainzAlbumStatus: tags['MusicBrainz Album Status'],
        musicBrainzArtistId: tags['MusicBrainz Artist Id'] ?? '',
        musicBrainzReleaseGroupId: tags['MusicBrainz Release Group Id'] ?? '',
        originalYear: Number(tags.originalyear),
        publisher: tags.publisher,
        releaseDate: tags.date,
        releaseType: tags['MusicBrainz Album Type'] ?? '',
        tmed: tags.TMED,
        trackCount: Number(tags.Tracktotal),
        ts02: tags.TSO2,
      };

      const currentTrack = libraryTracks.get(trackId) ?? {
        completedAt: new Date().toISOString(),
        downloadPath: filePath,
        id: trackId,
        musicBrainzReleaseTrackId: tags['MusicBrainz Release Track Id'] ?? '',
        musicBrainzTrackId: tags['MusicBrainz Track Id'] ?? '',
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
