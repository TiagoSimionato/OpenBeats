import { ScanLibraryButton } from '../ScanLibraryButton';
import { SignOutButton } from '../SignOutButton';
import { Nav } from './Nav';

export const Header = () => (
  <header className="flex items-center gap-8 pb-4">
    <h1 className="text-2xl font-semibold">OpenBeats</h1>
    <Nav />
    <ScanLibraryButton />
    <SignOutButton />
  </header>
);
