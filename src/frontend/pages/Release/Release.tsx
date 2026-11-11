'use client';

import type { LibraryReleaseData } from 'common/types/requests/library';
import type { ListTracks } from './components/TrackList';
import type { ReleasePageParams } from './type';
import { HttpStatusCode, isAxiosError } from 'axios';
import { getMBRelease, mapMBResponseToTracks } from 'common/utils';
import { ROUTES } from 'configs/routes';
import { useGetLibraryRelease } from 'frontend/services/api/queries/library';
import { useMBGetRelease } from 'frontend/services/mbApi/queries/releases';
import { Divider } from 'frontend/ui/Divider';
import { Spinner } from 'frontend/ui/Spinner';
import { Disc3Icon } from 'lucide-react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Fragment } from 'react/jsx-runtime';
import { CoverImage } from '../../ui/CoverImage';
import { About } from './components/About/About';
import { ActionAddReleaseCover } from './components/ActionAddReleaseCover';
import { ActionDeleteRelease } from './components/ActionDeleteRelease';
import { ActionImportReleaseCover } from './components/ActionImportReleaseCover';
import { DropDownActions } from './components/DropDownActions';
import { MultiActions } from './components/MultiActions/MultiActions';
import { TrackList } from './components/TrackList';

type ReleasePageProps = {
  defaultRelease?: LibraryReleaseData;
  isLibraryView?: boolean;
};

export const ReleasePage = ({ defaultRelease, isLibraryView }: ReleasePageProps) => {
  const { releaseId } = useParams<ReleasePageParams>();
  const { data: libraryRelease, error } = useGetLibraryRelease({
    options: {
      initialData: { libraryRelease: defaultRelease },
    },
    releaseId,
  });
  const { data: mbRelease } = useMBGetRelease({ releaseId });
  const router = useRouter();

  const release = libraryRelease?.libraryRelease;

  useEffect(() => {
    if (isAxiosError(error) && error.status === HttpStatusCode.NotFound && isLibraryView)
      router.replace(ROUTES.HOME);
  }, [error, isLibraryView, router]);

  if (!release && isLibraryView)
    return notFound();

  const mbTracks = mbRelease ? mapMBResponseToTracks(mbRelease) : undefined;

  if (!release && !mbTracks) {
    return (
      <div className="flex grow items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  const releaseInfo = {
    album: release?.album ?? getMBRelease.album(mbRelease),
    albumArtist: release?.albumArtist ?? getMBRelease.albumArtist(mbRelease),
    discTotal: release?.discTotal ?? getMBRelease.distTotal(mbRelease),
    originalYear: release?.originalYear ?? getMBRelease.originalYear(mbRelease),
    releaseType: release?.releaseType ?? getMBRelease.releaseType(mbRelease),
    trackCount: release?.trackCount ?? getMBRelease.trackTotal(mbRelease),
  } as const;

  const listTracks: ListTracks[] = mbTracks
    ? mbTracks.map(mbTrack => ({
        libraryTrack: release?.tracks.find(
          it =>
            it.id === mbTrack['MusicBrainz Track Id']
            || it.id === mbTrack['MusicBrainz Release Track Id'],
        ),
        mbTrack,
      }))
    : (release?.tracks.map(track => ({
        libraryTrack: track,
        mbTrack: undefined,
      })) ?? []);

  const discs = Array.from({ length: releaseInfo.discTotal })
    .fill(0)
    .map((_, index) =>
      listTracks.filter(
        ({ libraryTrack, mbTrack }) => (libraryTrack?.disc ?? mbTrack?.disc) === index + 1,
      ),
    );

  const items = [
    releaseInfo.albumArtist,
    `${releaseInfo.trackCount} tracks`,
    releaseInfo.originalYear,
  ];

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="ml-auto flex items-start gap-4 pb-4 sm:order-last sm:self-stretch">
          <DropDownActions>
            <ActionImportReleaseCover />
            <ActionAddReleaseCover />
            <ActionDeleteRelease title={releaseInfo.album} />
          </DropDownActions>
        </div>
        <CoverImage
          releaseId={releaseId}
          releaseName={releaseInfo.album}
          size={250}
          withoutCaaFallback={!!release}
        />
        <div className="flex flex-col justify-end gap-4 capitalize sm:gap-10">
          <span className="hidden sm:block">{releaseInfo.releaseType.split(';')[0]}</span>
          <h1 className="text-center text-5xl font-bold sm:text-start">{releaseInfo.album}</h1>
          <span className="text-center sm:text-start">{items.join(' • ')}</span>
        </div>
      </div>
      <div className="flex flex-col">
        <MultiActions />
        {discs.map((tracks, index) => (
          <Fragment
            key={`disc-${tracks.reduce((acc, track) => acc.concat(track.libraryTrack?.title ?? track.mbTrack?.title ?? ''), index.toString())}`}
          >
            {releaseInfo.discTotal > 1 && index > 0 && <Divider />}
            {releaseInfo.discTotal > 1 && (
              <div className="flex items-center gap-2 py-3 text-lg font-bold">
                <Disc3Icon size={32} />
                <span>
                  Disc
                  {` ${index + 1}`}
                </span>
              </div>
            )}
            {releaseInfo.discTotal > 1 && <Divider />}
            <TrackList tracks={tracks} />
          </Fragment>
        ))}
      </div>
      <About />
    </main>
  );
};
