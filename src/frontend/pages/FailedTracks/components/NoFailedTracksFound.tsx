import { Icon } from 'frontend/ui/Icon';

export const NoFailedTracksFound = () => (
  <div className="flex grow flex-col items-center justify-center gap-4 text-center text-lg">
    <Icon className="w-16" name="search-off" />
    <p>There are no failed tracks registered</p>
    <p>They will appear here in case something fails as you try to add them to your library</p>
  </div>
);
