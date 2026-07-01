export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./loggger');
    const { releasesRepository } = await import('backend/repositories/releases.repository');
    await releasesRepository.scanReleasesFromDisk();
  }
};
