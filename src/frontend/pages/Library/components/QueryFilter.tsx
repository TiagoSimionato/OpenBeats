import { SearchParamsInput } from 'frontend/ui/SearchParamsInput';

export const QueryLibrary = () => (
  <div className="flex flex-col gap-2 md:w-4/7 xl:w-2/5">
    <span className="font-bold">Release Search</span>
    <SearchParamsInput placeholder="Search for releases, tracks or artists" queryKey="query" />
  </div>
);
