import type { LibraryReleaseData } from 'common/types/requests/library';
import { ROUTES } from 'configs/constants';
import { Fragment } from 'react/jsx-runtime';

type ReleaseCardProps = {
  release: LibraryReleaseData;
};

export const ReleaseCard = ({ release }: ReleaseCardProps) => {
  const footerData = [
    `${release.trackCount} tracks`,
    release.releaseType,
    ...(release.releaseDate ? [release.releaseDate.split('-')[0]] : []),
  ];

  return (
    <div className="hrow flex w-1/2 max-w-50 p-2">
      <a className="flex grow flex-col rounded-2xl" href={ROUTES.RELEASE(release.id)}>
        <img
          alt={`${release.album} cover art`}
          className="aspect-square w-full self-center rounded-2xl"
          height={250}
          src={`/api/covers/${release.id}`}
          width={250}
        />
        <div className="flex flex-col gap-0.5 p-2">
          <p>{release.album}</p>
          <p>{release.albumArtist}</p>
          <p>
            {footerData.map((item, index) => (
              <Fragment key={item}>
                {index > 0 && index < footerData.length && <> • </>}
                <>{item}</>
              </Fragment>
            ))}
          </p>
        </div>
      </a>
    </div>
  );
};
