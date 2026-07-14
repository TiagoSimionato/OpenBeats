import { ScanLibraryButton } from '../ScanLibraryButton';
import { SignOutButton } from '../SignOutButton';
import { Nav } from './Nav';

export const Header = () => (
  <header className="flex flex-wrap items-center gap-x-4 gap-y-4 pb-4 md:gap-x-8">
    <h1 className="text-2xl font-semibold">OpenBeats</h1>
    <SignOutButton className="ml-auto md:order-last md:ml-0" />
    <Nav />
    <ScanLibraryButton />
  </header>
);
