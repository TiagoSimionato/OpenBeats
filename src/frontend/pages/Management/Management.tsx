import { ROUTES } from 'configs/routes';
import { GainTagsButton } from 'frontend/ui/GainTagsButton';
import { ScanLibraryButton } from 'frontend/ui/ScanLibraryButton';
import { SyncCoversButton } from 'frontend/ui/SyncCoverButton';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';

export const ManagementPage = () => (
  <main className="flex flex-col gap-4">
    <div className="flex flex-col justify-center gap-4 sm:flex-row">
      <ScanLibraryButton />
      <SyncCoversButton />
      <GainTagsButton />
    </div>
    <Link
      className="flex justify-between self-stretch rounded-md p-2 hover:bg-white/30"
      href={ROUTES.FAILED_TRACKS}
    >
      Failed Tracks
      <ChevronRightIcon />
    </Link>
  </main>
);
