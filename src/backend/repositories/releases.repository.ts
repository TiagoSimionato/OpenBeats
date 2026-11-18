import type { Pagination } from 'backend/requests/pagination.dto';
import type { ReleasesFilters } from 'backend/requests/releases.dto';
import type { LibraryReleaseData, TrackRecord } from 'common/types/requests/library';
import type { Track } from 'common/types/requests/releases';
import { prisma } from 'backend/prisma/prisma';
import { dbService } from 'backend/services/db.service';
import { paginationFilters } from 'backend/utils';

const SELECT_LIBRARY_RELEASE = `
  SELECT
    r.id                                     AS id,
    r.album,
    r.album_artist                           AS albumArtist,
    r.release_type                           AS releaseType,
    r.release_date                           AS releaseDate,
    r.original_year                          AS originalYear,
    r.publisher,
    r.track_count                            AS trackCount,
    r.disc_total                             AS discTotal,
    r.tmed,
    r.music_brainz_album_release_country     AS musicBrainzAlbumReleaseCountry,
    r.music_brainz_album_status              AS musicBrainzAlbumStatus,
    r.music_brainz_album_artist_id           AS musicBrainzAlbumArtistId,
    r.music_brainz_album_id                  AS musicBrainzAlbumId,
    r.music_brainz_artist_id                 AS musicBrainzArtistId,
    r.music_brainz_release_group_id          AS musicBrainzReleaseGroupId,
    r.cover_path                             AS coverPath,
    json_group_array(
      json_object(
        'id',                        t.id,
        'releaseId',                 t.release_id,
        'title',                     t.title,
        'artist',                    t.artist,
        'artistSort',                t.artist_sort,
        'genre',                     t.genre,
        'downloadPath',              t.download_path,
        'disc',                      t.disc,
        'trackNumber',               t.track_number,
        'ts02',                      t.ts02,
        'musicBrainzReleaseTrackId', t.music_brainz_release_track_id,
        'musicBrainzTrackId',        t.music_brainz_track_id
      )
    ORDER BY t.disc ASC, t.track_number ASC) AS tracks
  FROM tb_releases r
  JOIN tb_tracks t on t.release_id = r.id
`;

export const listLibraryReleasesPaged = async (pagination: Pagination, filters: ReleasesFilters) => {
  const formatQuery = `%${filters.query ?? ''}%`;
  const rows = await dbService.list<LibraryReleaseData>(`
    ${SELECT_LIBRARY_RELEASE}
    WHERE r.album LIKE ?
      OR r.album_artist LIKE ?
      OR t.title LIKE ?
    GROUP BY r.id
    HAVING (? = 'complete' AND COUNT(t.id) = r.track_count)
      OR (? = 'partial' AND COUNT(t.id) < r.track_count)
      OR (? IS NULL)
    ORDER BY r.album ASC
    ${paginationFilters(pagination)};
  `, formatQuery, formatQuery, formatQuery, filters.status, filters.status, filters.status);
  const count = (await dbService.get<{ count: number }>('SELECT COUNT(*) as count FROM tb_releases r'))?.count ?? 0;

  return {
    data: rows.map(row => ({
      ...row,
      tracks: JSON.parse(row.tracks as unknown as string) as TrackRecord[],
    })),
    pages: Math.ceil(count / pagination.perPage),
  };
};

export const releasesRepository = prisma.release;

export const upsertRelease = async (track: Track) => {
  const release = {
    album: track.album,
    albumArtist: track.artist,
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
  };
  await releasesRepository.upsert({
    create: release,
    update: release,
    where: { id: release.id },
  });
};
