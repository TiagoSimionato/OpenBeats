import { scanDownloadedReleasesFromDisk } from 'backend/downloads';

export const register = async () => {
  await scanDownloadedReleasesFromDisk();
};
