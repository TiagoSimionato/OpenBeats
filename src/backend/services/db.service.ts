import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import Database from 'better-sqlite3';
import { CONFIGS } from 'configs/constants';

let databaseInstance: Database.Database | null = null;

const initDatabase = async () => {
  if (!existsSync(CONFIGS.CACHE_PATH)) {
    await mkdir(CONFIGS.CACHE_PATH, { recursive: true });
  }
  if (!existsSync(CONFIGS.DB_PATH)) {
    const database = new Database(CONFIGS.DB_PATH);
    databaseInstance = database;

    return database;
  }
  const database = new Database(CONFIGS.DB_PATH);
  databaseInstance = database;
  return database;
};

const getDatabase = () => {
  if (databaseInstance !== null)
    return databaseInstance;

  return initDatabase();
};

const list = async <T>(statement: string, ...args: unknown[]): Promise<T[]> => {
  const database = await getDatabase();
  const rows = database.prepare(statement).all(...args);
  return rows as T[];
};

export const dbService = {
  getDatabase,
  initDatabase,
  list,
};
