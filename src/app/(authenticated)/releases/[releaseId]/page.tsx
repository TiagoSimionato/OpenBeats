import { releasesRepository } from 'backend/repositories/releases.repository';
import { ReleasePage } from 'frontend/pages/Release/Release';

const Page = async ({ params }: { params: Promise<{ releaseId: string }> }) => {
  const releaseId = (await params).releaseId;

  const libraryRelease = await releasesRepository.getLibraryRelease(releaseId);

  return <ReleasePage defaultRelease={libraryRelease} />;
};

export default Page;
