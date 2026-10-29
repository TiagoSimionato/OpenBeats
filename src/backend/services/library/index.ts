import type { JobProgress } from 'common/types/requests/releases';
import { addLibraryService } from './add.service';
import { coversManagerService } from './cover.service';
import { libraryDeletionService } from './deletion.service';
import { downloaderService } from './downloader.service';
import { metadataService } from './metadata.service';
import { rsGainService } from './rsgain.service';
import { scannerService } from './scanner.service';

export type OnProgress = ((progress: Omit<Partial<JobProgress>, 'jobId'>) => void) | undefined;

export const libraryManagerService = {
  add: addLibraryService,
  covers: coversManagerService,
  delete: libraryDeletionService,
  downloader: downloaderService,
  metadata: metadataService,
  rsgain: rsGainService,
  scanner: scannerService,
};
