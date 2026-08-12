import { execFileAsync } from 'backend/utils';
import { CONFIGS } from 'configs/constants';
import { handlePromise } from 'tsm-utils';

export const runRsgain = handlePromise(async ({ args = ['easy', '--skip-existing'], directoryPath, title }: { args?: string[]; directoryPath?: string; title: string }) => {
  const execPath = directoryPath ?? CONFIGS.DOWNLOAD_PATH;

  await execFileAsync(CONFIGS.RSGAIN_BIN, [
    ...args,
    execPath,
  ]);

  console.log(`rsgain: tagged ${title}`);
}, (error) => {
  console.log(`rsgain: ${error}`);
});
