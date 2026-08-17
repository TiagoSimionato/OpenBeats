import type { ReleasePageParams } from '../../type';
import { useGetLibraryRelease } from 'frontend/services/api/queries/library';
import { useParams } from 'next/navigation';
import { Fragment } from 'react/jsx-runtime';
import { buildAbout } from './buildAbout';

export const About = () => {
  const { releaseId } = useParams<ReleasePageParams>();
  const { data } = useGetLibraryRelease({
    releaseId,
  });
  const release = data?.libraryRelease;

  if (!release)
    return null;

  const about = buildAbout(release);

  return (
    <>
      <h2 className="text-2xl font-bold">About release</h2>
      <div className="grid grid-cols-[minmax(144px,1fr)_3fr]">
        {about.map(({ label, value }, index) => {
          const isOdd = index % 2 !== 0;
          return (
            <Fragment key={label}>
              <span className={`py-1 font-bold ${isOdd ? 'bg-gray-400/10' : ''}`}>
                {label}
                {': '}
              </span>
              <span className={`py-1 ${isOdd ? 'bg-gray-400/10' : ''}`}>{value}</span>
            </Fragment>
          );
        })}
      </div>
    </>
  );
};
