import { ReleaseSearchPage } from 'frontend/pages/ReleaseSearch/ReleasesSearch';
import { Suspense } from 'react';

const Page = () => (
  <Suspense fallback={<></>}>
    <ReleaseSearchPage />
  </Suspense>
);

export default Page;
