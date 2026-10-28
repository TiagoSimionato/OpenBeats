import { dbService } from 'backend/services/db.service';

type Configs = {
  defaultCoverSize: number;
};

const createDDL = async () => {
  const database = await dbService.getDatabase();

  database.exec(`
    CREATE TABLE IF NOT EXISTS tb_configs (
      id INTEGER PRIMARY KEY,
      default_cover_size INTEGER NOT NULL
    );`);
};

const listConfigs = async () => {
  const rows = await dbService.list<Configs>(`
    SELECT *
    FROM tb_configs
  `);

  return rows;
};

const upsertConfigs = async (configs: Configs) => {
  await dbService.dbExec(`
    INSERT INTO tb_tracks (
      id,
      default_cover_size
    ) VALUES (
      1,
      @defaultCoverSize
    )
    ON CONFLICT(id) DO UPDATE SET
      default_cover_size = excluded.default_cover_size
  `, configs);
};

export const configsRepository = {
  createDDL,
  listConfigs,
  upsertConfigs,
};
