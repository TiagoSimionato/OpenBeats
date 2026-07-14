'use client';

import type { LibraryReleaseData } from 'common/types/requests/library';
import type { ListTracks } from './components/TrackList';
import { isAxiosError } from 'axios';
import { mapReleaseTracksToDownloadTracks } from 'common/utils';
import { ROUTES } from 'configs/routes';
import { useDeleteLibraryRelease } from 'frontend/services/api/mutations/library';
import { useGetLibraryRelease } from 'frontend/services/api/queries/library';
import { useMBGetRelease } from 'frontend/services/mbApi/queries/releases';
import { Button } from 'frontend/ui/Button';
import { Disc3Icon, SaveIcon, TrashIcon } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import { Fragment } from 'react/jsx-runtime';
import { CoverImage } from '../../ui/CoverImage';
import { buildAbout } from './components/buildAbout';
import { TrackList } from './components/TrackList';

type ReleasePageProps = {
  defaultRelease?: LibraryReleaseData;
  releaseId: string;
};

export const ReleasePage = ({ defaultRelease, releaseId }: ReleasePageProps) => {
  const {
    data: libraryRelease,
    error,
    isStale,
  } = useGetLibraryRelease({
    options: {
      initialData: { libraryRelease: defaultRelease },
    },
    releaseId,
  });
  const { data: mbRelease } = useMBGetRelease({ releaseId });
  const { isPending, mutate: deleteRelease } = useDeleteLibraryRelease();

  const release = libraryRelease?.libraryRelease;

  if (!release)
    return notFound();

  if (isAxiosError(error) && error.status === 404 && !isStale) {
    redirect(ROUTES.HOME);
  }

  const mbTracks = mbRelease ? mapReleaseTracksToDownloadTracks(mbRelease) : undefined;

  const listTracks: ListTracks[] = mbTracks
    ? mbTracks.map(mbTrack => ({
        libraryTrack: release.tracks.find(it => it.id === mbTrack['MusicBrainz Track Id']),
        mbTrack,
      }))
    : release.tracks.map(track => ({
        libraryTrack: track,
        mbTrack: undefined,
      }));

  const discs = Array.from({ length: release.discTotal })
    .fill(0)
    .map((_, index) =>
      listTracks.filter(
        ({ libraryTrack, mbTrack }) => (libraryTrack?.disc ?? mbTrack?.disc) === index + 1,
      ),
    );

  const items = [release.albumArtist, `${release.trackCount} tracks`, release.originalYear];

  const about = buildAbout(release);

  return (
    <main className="flex flex-col gap-4">
      <div className="flex gap-4">
        <CoverImage coverId={release.coverPath} releaseName={release.album} size={250} />
        <div className="flex flex-col justify-end gap-10">
          <span>{release.releaseType}</span>
          <h1 className="text-5xl font-bold">{release.album}</h1>
          <span>{items.join(' • ')}</span>
        </div>
        <div className="ml-auto flex items-start gap-4">
          <Button isLoading={isPending} size="xs" variant="tertiary">
            <TrashIcon onClick={() => deleteRelease(releaseId)} />
          </Button>
          <Button size="xs" variant="tertiary">
            <SaveIcon />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {discs.map((tracks, index) => (
          <Fragment key={`disc-${tracks[0].libraryTrack?.disc ?? tracks[0].mbTrack?.disc}`}>
            {release.discTotal > 1 && index > 0 && <span className="border-primary border-t" />}
            {release.discTotal > 1 && (
              <div className="flex gap-2 pl-4">
                <Disc3Icon />
                <span>
                  Disc
                  {` ${index + 1}`}
                </span>
              </div>
            )}
            {release.discTotal > 1 && <span className="border-primary border-t" />}
            <TrackList tracks={tracks} />
          </Fragment>
        ))}
      </div>
      <h2 className="text-2xl font-bold">About release</h2>
      <div className="flex flex-col">
        {about.map(({ label, value }) => (
          <span key={label}>
            <span className="text-light font-bold">
              {label}
              {': '}
            </span>
            {value}
          </span>
        ))}
      </div>
    </main>
  );
};
