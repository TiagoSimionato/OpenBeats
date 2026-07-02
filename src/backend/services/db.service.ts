import { mkdir } from 'node:fs/promises';
import Database from 'better-sqlite3';
import { CONFIGS } from 'configs/constants';

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

export const dbService = {
  dbExec,
  getDatabase,
};
