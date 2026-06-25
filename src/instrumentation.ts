export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { scanDownloadedReleasesFromDisk } = await import('backend/downloads');
    await scanDownloadedReleasesFromDisk();
  }
};
