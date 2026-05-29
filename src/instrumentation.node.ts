import { ensureDownloadIndexReady } from 'backend/downloads';

export const register = async () => {
  await ensureDownloadIndexReady();
};
