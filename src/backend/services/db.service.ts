import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { releasesRepository } from 'backend/repositories/releases.repository';
import { userRepository } from 'backend/repositories/user.repository';
import Database from 'better-sqlite3';
import { CONFIGS } from 'configs/constants';
import { isEmpty } from 'tsm-utils';

let databaseInstance: Database.Database | null = null;

const initDatabase = async () => {
  if (!existsSync(CONFIGS.CACHE_PATH)) {
    await mkdir(CONFIGS.CACHE_PATH, { recursive: true });
  }
  if (!existsSync(CONFIGS.DB_PATH)) {
    const database = new Database(CONFIGS.DB_PATH);
    databaseInstance = database;

    await userRepository.createDDL();
    await userRepository.createDefaultUser();
    await releasesRepository.createDDL();

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

const list = async <T>(statement: string): Promise<T[]> => {
  const database = await getDatabase();
  const rows = database.prepare(statement).all();
  return rows as T[];
};

const get = async <T>(statement: string, ...args: unknown[]): Promise<T | undefined> => {
  const database = await getDatabase();
  const row = database.prepare(statement).get(...args) as any;
  if (isEmpty(row))
    return undefined;
  return row as T;
};

export const dbService = {
  dbExec,
  get,
  getDatabase,
  initDatabase,
  list,
};
