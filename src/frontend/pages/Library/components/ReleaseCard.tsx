import type { LibraryReleaseData } from 'common/types/requests/library';
import { ROUTES } from 'configs/clientConstants';
import { Icon } from 'frontend/ui/Icon';
import Image from 'next/image';
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
    <div className="w-1/2 max-w-50 p-2">
      <Link className="flex grow flex-col rounded-2xl" href={ROUTES.RELEASE(release.id)}>
        {release.coverPath
          ? (
              <Image
                alt={`${release.album} cover art`}
                className="aspect-square w-full rounded-2xl"
                height={250}
                loading="eager"
                src={`/api/covers/${release.coverPath}`}
                unoptimized
                width={250}
              />
            )
          : (
              <Icon className="aspect-square w-full" name="disc-album" />
            )}
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
