import type { FailedTrack } from 'common/types/requests/failedTracks';
import { dbService } from 'backend/services/db.service';

const createDDL = async () => {
  const database = await dbService.getDatabase();

  database.exec(`
    CREATE TABLE IF NOT EXISTS tb_failed_tracks (
      track_id UUID PRIMARY KEY,
      release_id UUID NOT NULL,
      title TEXT NOT NULL,
      artist TEXT,
      reason TEXT NOT NULL
    );`);
};

const upsertFailedTrack = async (record: FailedTrack) => {
  await dbService.dbExec(`
    INSERT INTO tb_failed_tracks (
      track_id,
      release_id,
      title,
      artist,
      reason
    ) VALUES (
      @trackId,
      @releaseId,
      @title,
      @artist,
      @reason
    )
    ON CONFLICT(track_id) DO UPDATE SET
      release_id = excluded.release_id,
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
    SELECT *
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
