import { ROUTES } from 'configs/routes';
import { GainTagsButton } from 'frontend/ui/GainTagsButton';
import { ScanLibraryButton } from 'frontend/ui/ScanLibraryButton';
import { SyncCoversButton } from 'frontend/ui/SyncCoverButton';
import Link from 'next/link';

export const ManagementPage = () => (
  <main className="flex flex-col gap-4 sm:items-start">
    <ScanLibraryButton />
    <SyncCoversButton />
    <GainTagsButton />
    <Link href={ROUTES.FAILED_TRACKS}>Failed Tracks</Link>
  </main>
);
