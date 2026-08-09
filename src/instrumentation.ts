import 'reflect-metadata';

export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('configs/loggger');
    const { existsSync } = await import('node:fs');
    const { CONFIGS } = await import('configs/constants');
    const { dbService } = await import('backend/services/db.service');

    if (!existsSync(CONFIGS.DB_PATH)) {
      await dbService.initDatabase();
      const { libraryManagerService } = await import('backend/services/libraryManager.service');
      libraryManagerService.scanReleasesFromDisk();
    }
    else {
      await dbService.initDatabase();
    }
  }
};
