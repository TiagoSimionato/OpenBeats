import { QueryLibrary } from './QueryFilter';
import { StatusFilter } from './StatusFilter';

export const LibraryFilters = () => (
  <div className="flex flex-col flex-wrap gap-4 md:flex-row md:items-start">
    <QueryLibrary />
    <StatusFilter />
  </div>
);
