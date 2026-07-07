import { ROUTES } from 'configs/constants';
import { Icon } from 'frontend/ui/Icon';

export const NoReleasesFound = () => (
  <div className="flex grow flex-col items-center justify-center gap-4 text-lg">
    <Icon className="w-16" name="search-off" />
    <p>No release was found on your library.</p>
    <p>
      Try going to the
      {' '}
      <a className="text-primary" href={ROUTES.SEARCH}>
        {' '}
        Search Page
      </a>
      {' '}
      to start building your library or try verifying the library path
    </p>
  </div>
);
