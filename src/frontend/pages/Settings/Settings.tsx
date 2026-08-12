import { GainTagsButton } from 'frontend/ui/GainTagsButton';
import { ScanLibraryButton } from 'frontend/ui/ScanLibraryButton';
import { SyncCoversButton } from 'frontend/ui/SyncCoverButton';

export const SettingsPage = () => (
  <main className="flex flex-col gap-4 sm:items-start">
    <ScanLibraryButton />
    <SyncCoversButton />
    <GainTagsButton />
  </main>
);
