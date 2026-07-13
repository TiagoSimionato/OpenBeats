export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('configs/loggger');
    const { existsSync } = await import('node:fs');
    const { CONFIGS } = await import('configs/constants');
    const { dbService } = await import('backend/services/db.service');

    if (!existsSync(CONFIGS.DB_PATH)) {
      await dbService.initDatabase();
      const { releasesRepository } = await import('backend/repositories/releases.repository');
      await releasesRepository.scanReleasesFromDisk();
    }
    else {
      await dbService.initDatabase();
    }
  }
};
