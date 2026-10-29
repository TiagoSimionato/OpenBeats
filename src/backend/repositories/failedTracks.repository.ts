import type { FailedTrack } from 'common/types/requests/failedTracks';
import { dbService } from 'backend/services/db.service';

const createDDL = async () => {
  const database = await dbService.getDatabase();

  database.exec(`
    CREATE TABLE IF NOT EXISTS tb_failed_tracks (
      release_id UUID NOT NULL,
      track_id UUID NOT NULL,
      title TEXT,
      artist TEXT,
      reason TEXT NOT NULL,
      PRIMARY KEY (track_id, release_id)
    );`);
};

const upsertFailedTrack = async (record: FailedTrack) => {
  await dbService.dbExec(`
    INSERT INTO tb_failed_tracks (
      release_id,
      track_id,
      title,
      artist,
      reason
    ) VALUES (
      @releaseId,
      @trackId,
      @title,
      @artist,
      @reason
    )
    ON CONFLICT(release_id,track_id) DO UPDATE SET
      title = excluded.title,
      artist = excluded.artist,
      reason = excluded.reason
  `, record);
};

const deleteFailedTrack = async (trackId: string) => {
  await dbService.dbExec(`
    DELETE FROM tb_failed_tracks
    WHERE track_id = ?
  `, trackId);
};

const listFailedTracks = async () => {
  const rows = await dbService.list<FailedTrack>(`
    SELECT
    release_id as releaseId,
      track_id as trackId,
      title,
      artist,
      reason
    FROM tb_failed_tracks
  `);

  return rows;
};

export const failedTracksRepository = {
  createDDL,
  deleteFailedTrack,
  listFailedTracks,
  upsertFailedTrack,
};
