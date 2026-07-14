import type { LibraryReleaseData } from 'common/types/requests/library';
import { ROUTES } from 'configs/routes';
import { CoverImage } from 'frontend/ui/CoverImage';
import Link from 'next/link';
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
    <div className="w-1/2 p-2 sm:w-auto">
      <Link
        className="flex grow flex-col items-center rounded-2xl"
        href={ROUTES.RELEASE(release.id)}
      >
        <CoverImage
          className="rounded-2xl"
          coverId={release.coverPath}
          iconFallback="disc-album"
          releaseName={release.album}
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
      </Link>
    </div>
  );
};
