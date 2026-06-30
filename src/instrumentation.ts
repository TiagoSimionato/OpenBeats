export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { dbService } = await import('backend/services/db.service');
    await dbService.scanReleasesFromDisk();
  }
};
