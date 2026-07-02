import { ScanLibraryButton } from './ScanLibraryButton';
import { SignOutButton } from './SignOutButton';

export const Header = () => (
  <header className="flex items-center gap-8">
    <h1 className="text-2xl font-semibold">OpenBeats</h1>
    <nav>
      <ul className="flex gap-5">
        <li>
          <a href="/">
            Search
          </a>
        </li>
        <li>
          <a href="/library">
            Library
          </a>
        </li>
      </ul>
    </nav>
    <ScanLibraryButton />
    <SignOutButton />
  </header>
);
