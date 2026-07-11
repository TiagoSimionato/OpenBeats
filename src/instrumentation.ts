export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('configs/loggger');
    const { dbService } = await import('backend/services/db.service');
    dbService.initDatabase();

    const { releasesRepository } = await import('backend/repositories/releases.repository');
    await releasesRepository.scanReleasesFromDisk();
  }
};
