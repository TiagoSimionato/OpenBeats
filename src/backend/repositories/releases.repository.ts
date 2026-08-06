import type { Pagination } from 'backend/requestss/pagination.module';
import type { LibraryReleaseData, ReleaseRecord, TrackRecord } from 'common/types/requests/library';
import type { Track } from 'common/types/requests/releases';
import { dbService } from 'backend/services/db.service';
import { paginationFilters } from 'backend/utils';

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
      publisher TEXT,
      track_count INTEGER NOT NULL,
      disc_total INTEGER NOT NULL,
      tmed TEXT,
      ts02 TEXT,
      music_brainz_album_release_country TEXT,
      music_brainz_album_status TEXT,
      music_brainz_album_artist_id UUID NOT NULL,
      music_brainz_album_id UUID NOT NULL,
      music_brainz_artist_id UUID NOT NULL,
      music_brainz_release_group_id UUID NOT NULL,
      cover_path TEXT
    );`);
  database.exec(`
    CREATE TABLE IF NOT EXISTS tb_tracks (
      id UUID PRIMARY KEY,
      release_id UUID NOT NULL REFERENCES tb_releases(id),
      title TEXT NOT NULL,
      genre TEXT,
      download_path TEXT NOT NULL,
      disc INTEGER NOT NULL,
      track_number INTEGER NOT NULL,
      music_brainz_release_track_id UUID NOT NULL,
      music_brainz_track_id UUID NOT NULL
    );`);
};

const upsertLibraryRelease = async (record: ReleaseRecord) => {
  await dbService.dbExec(`
    INSERT INTO tb_releases (
      id,
      album,
      album_artist,
      artist,
      artist_sort,
      release_type,
      release_date,
      original_year,
      publisher,
      track_count,
      disc_total,
      tmed,
      ts02,
      music_brainz_album_release_country,
      music_brainz_album_status,
      music_brainz_album_artist_id,
      music_brainz_album_id,
      music_brainz_artist_id,
      music_brainz_release_group_id,
      cover_path
    ) VALUES (
      @id,
      @album,
      @albumArtist,
      @artist,
      @artistSort,
      @releaseType,
      @releaseDate,
      @originalYear,
      @publisher,
      @trackCount,
      @discTotal,
      @tmed,
      @ts02,
      @musicBrainzAlbumReleaseCountry,
      @musicBrainzAlbumStatus,
      @musicBrainzAlbumArtistId,
      @musicBrainzAlbumId,
      @musicBrainzArtistId,
      @musicBrainzReleaseGroupId,
      @coverPath
    )
    ON CONFLICT(id) DO UPDATE SET
      album = excluded.album,
      album_artist = excluded.album_artist,
      artist = excluded.artist,
      artist_sort = excluded.artist_sort,
      release_type = excluded.release_type,
      release_date = excluded.release_date,
      original_year = excluded.original_year,
      publisher = excluded.publisher,
      track_count = excluded.track_count,
      disc_total = excluded.disc_total,
      tmed = excluded.tmed,
      ts02 = excluded.ts02,
      music_brainz_album_release_country = excluded.music_brainz_album_release_country,
      music_brainz_album_status = excluded.music_brainz_album_status,
      music_brainz_album_artist_id = excluded.music_brainz_album_artist_id,
      music_brainz_album_id = excluded.music_brainz_album_id,
      music_brainz_artist_id = excluded.music_brainz_artist_id,
      music_brainz_release_group_id = excluded.music_brainz_release_group_id,
      cover_path = excluded.cover_path;
  `, record);
};

const upsertLibraryTrack = async (record: TrackRecord) => {
  await dbService.dbExec(`
    INSERT INTO tb_tracks (
      id,
      release_id,
      title,
      genre,
      download_path,
      disc,
      track_number,
      music_brainz_release_track_id,
      music_brainz_track_id
    ) VALUES (
      @id,
      @releaseId,
      @title,
      @genre,
      @downloadPath,
      @disc,
      @trackNumber,
      @musicBrainzReleaseTrackId,
      @musicBrainzTrackId
    )
    ON CONFLICT(id) DO UPDATE SET
      release_id = excluded.release_id,
      title = excluded.title,
      genre = excluded.genre,
      download_path = excluded.download_path,
      disc = excluded.disc,
      track_number = excluded.track_number,
      music_brainz_release_track_id = excluded.music_brainz_release_track_id,
      music_brainz_track_id = excluded.music_brainz_track_id;
  `, record);
};

const upsertRelease = (track: Track) => {
  upsertLibraryRelease({
    album: track.album,
    albumArtist: track.artist,
    artist: track.artist,
    artistSort: track['artist-sort'],
    coverPath: track.coverPath ? track['MusicBrainz Album Id'] : undefined,
    discTotal: track.Disctotal,
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
    tmed: track.TMED,
    trackCount: track.Tracktotal,
    ts02: track.TSO2,
  });
};

const deleteRelease = async (releaseId: string) => {
  await dbService.dbExec(`
    DELETE FROM tb_tracks
    WHERE release_id = ?;
  `, releaseId);
  await dbService.dbExec(`
    DELETE FROM tb_releases
    WHERE id = ?;
  `, releaseId);
};

const deleteTrack = async (trackId: string) => {
  await dbService.dbExec(`
    DELETE FROM tb_tracks
    WHERE id = ?
  `, trackId);
};

const SELECT_LIBRARY_RELEASE = `
  SELECT
    r.id                                 AS id,
    r.album,
    r.album_artist                       AS albumArtist,
    r.artist,
    r.artist_sort                        AS artistSort,
    r.release_type                       AS releaseType,
    r.release_date                       AS releaseDate,
    r.original_year                      AS originalYear,
    r.publisher,
    r.track_count                        AS trackCount,
    r.disc_total                         AS discTotal,
    r.tmed,
    r.ts02,
    r.music_brainz_album_release_country AS musicBrainzAlbumReleaseCountry,
    r.music_brainz_album_status          AS musicBrainzAlbumStatus,
    r.music_brainz_album_artist_id       AS musicBrainzAlbumArtistId,
    r.music_brainz_album_id              AS musicBrainzAlbumId,
    r.music_brainz_artist_id             AS musicBrainzArtistId,
    r.music_brainz_release_group_id      AS musicBrainzReleaseGroupId,
    r.cover_path                         AS coverPath,
    json_group_array(
      json_object(
        'id',                        t.id,
        'releaseId',                 t.release_id,
        'title',                     t.title,
        'genre',                     t.genre,
        'downloadPath',              t.download_path,
        'disc',                      t.disc,
        'trackNumber',               t.track_number,
        'musicBrainzReleaseTrackId', t.music_brainz_release_track_id,
        'musicBrainzTrackId',        t.music_brainz_track_id
      )
    ORDER BY t.disc ASC, t.track_number ASC)         AS tracks
  FROM tb_releases r
  JOIN tb_tracks t on t.release_id = r.id
`;

const listLibraryReleases = async () => {
  const rows = await dbService.list<LibraryReleaseData>(`
    ${SELECT_LIBRARY_RELEASE}
    GROUP BY r.id
    ORDER BY r.album ASC
  `);

  return rows.map(row => ({
    ...row,
    tracks: JSON.parse(row.tracks as unknown as string) as TrackRecord[],
  }));
};

const listLibraryReleasesPaged = async (pagination: Pagination, query?: null | string) => {
  const formatQuery = `%${query ?? ''}%`;

  const rows = await dbService.list<LibraryReleaseData>(`
    ${SELECT_LIBRARY_RELEASE}
    WHERE r.album LIKE ?
      OR r.album_artist LIKE ?
      OR t.title LIKE ?
    GROUP BY r.id
    ORDER BY r.album ASC
    ${paginationFilters(pagination)};
  `, formatQuery, formatQuery, formatQuery)
    ;
  const count = (await dbService.get<{ count: number }>('SELECT COUNT(*) as count FROM tb_releases r'))?.count ?? 0;

  return {
    data: rows.map(row => ({
      ...row,
      tracks: JSON.parse(row.tracks as unknown as string) as TrackRecord[],
    })),
    pages: Math.ceil(count / pagination.perPage),
  };
};

const getLibraryRelease = async (releaseId: string) => {
  const row = await dbService.get<LibraryReleaseData>(`
    ${SELECT_LIBRARY_RELEASE}
    WHERE r.id = ?;
  `, releaseId);

  if (row) {
    return {
      ...row,
      tracks: JSON.parse(row.tracks as unknown as string) as TrackRecord[],
    };
  }
};

export const releasesRepository = {
  createDDL,
  deleteRelease,
  deleteTrack,
  getLibraryRelease,
  listLibraryReleases,
  listLibraryReleasesPaged,
  upsertLibraryRelease,
  upsertLibraryTrack,
  upsertRelease,
};
