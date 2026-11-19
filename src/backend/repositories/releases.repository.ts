import type { Pagination } from 'backend/requests/pagination.dto';
import type { ReleasesFilters } from 'backend/requests/releases.dto';
import type { LibraryReleaseData } from 'common/types/requests/library';
import type { Track } from 'common/types/requests/releases';
import { Prisma } from 'backend/prisma/generated/client';
import { prisma } from 'backend/prisma/prisma';

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

export const listLibraryReleasesPaged = async (
  pagination: Pagination,
  filters: ReleasesFilters,
) => {
  const query = filters.query ?? '';

  const whereClause = query
    ? Prisma.sql`WHERE r.album LIKE ${`%${query}%`}
       OR r.album_artist LIKE ${`%${query}%`}
       OR t.title LIKE ${`%${query}%`}`
    : Prisma.empty;

  const havingSql = filters.status
    ? Prisma.raw(
        `HAVING (COUNT(t.id) = r.track_count AND '${filters.status}' = 'complete')
       OR (COUNT(t.id) < r.track_count AND '${filters.status}' = 'partial')
       OR ('${filters.status}' IS NULL)`,
      )
    : Prisma.empty;

  const rows = await prisma.$queryRaw<LibraryReleaseData[]>`
    SELECT
      r.id, r.album, r.album_artist AS albumArtist,
      r.release_type AS releaseType, r.release_date AS releaseDate,
      r.original_year AS originalYear, r.publisher,
      r.track_count AS trackCount, r.disc_total AS discTotal,
      r.tmed, r.cover_path AS coverPath,
      json_group_array(
        json_object(
          'id', t.id, 'releaseId', t.release_id, 'title', t.title,
          'artist', t.artist, 'artistSort', t.artist_sort,
          'genre', t.genre, 'downloadPath', t.download_path,
          'disc', t.disc, 'trackNumber', t.track_number,
          'ts02', t.ts02,
          'musicBrainzReleaseTrackId', t.music_brainz_release_track_id,
          'musicBrainzTrackId', t.music_brainz_track_id
        )
      ORDER BY t.disc ASC, t.track_number ASC
      ) AS tracks
    FROM tb_releases r
    JOIN tb_tracks t ON t.release_id = r.id
    ${whereClause}
    GROUP BY r.id
    ${havingSql}
    ORDER BY r.album ASC
    LIMIT ${pagination.perPage}
    OFFSET ${(pagination.page - 1) * pagination.perPage}
  `;

  const count = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(*) as count FROM (
      SELECT r.id
      FROM tb_releases r
      JOIN tb_tracks t ON t.release_id = r.id
      ${whereClause}
      GROUP BY r.id
      ${havingSql}
    ) sub
  `;

  return {
    data: rows,
    pages: Math.ceil(Number(count[0]?.count ?? 0n) / pagination.perPage),
  };
};
