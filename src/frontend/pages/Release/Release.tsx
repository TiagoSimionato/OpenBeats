'use client';

import type { LibraryReleaseData } from 'common/types/requests/library';
import type { ListTracks } from './components/TrackList';
import type { ReleasePageParams } from './type';
import { HttpStatusCode, isAxiosError } from 'axios';
import { mapMBResponseToTracks } from 'common/utils';
import { ROUTES } from 'configs/routes';
import { useGetLibraryRelease } from 'frontend/services/api/queries/library';
import { useMBGetRelease } from 'frontend/services/mbApi/queries/releases';
import { Disc3Icon } from 'lucide-react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Fragment } from 'react/jsx-runtime';
import { CoverImage } from '../../ui/CoverImage';
import { ActionAddReleaseCover } from './components/ActionAddReleaseCover';
import { ActionDeleteRelease } from './components/ActionDeleteRelease';
import { ActionImportReleaseCover } from './components/ActionImportReleaseCover';
import { buildAbout } from './components/buildAbout';
import { DropDownActions } from './components/DropDownActions';
import { TrackList } from './components/TrackList';

type ReleasePageProps = {
  defaultRelease?: LibraryReleaseData;
};

export const ReleasePage = ({ defaultRelease }: ReleasePageProps) => {
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

  if (!release)
    return notFound();

  if (isAxiosError(error) && error.status === HttpStatusCode.NotFound) {
    router.replace(ROUTES.HOME);
  }

  const mbTracks = mbRelease ? mapMBResponseToTracks(mbRelease) : undefined;

  const listTracks: ListTracks[] = mbTracks
    ? mbTracks.map(mbTrack => ({
        libraryTrack: release.tracks.find(
          it =>
            it.id === mbTrack['MusicBrainz Track Id']
            || it.id === mbTrack['MusicBrainz Release Track Id'],
        ),
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
    <main className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="ml-auto flex items-start gap-4 pb-4 sm:order-last sm:self-stretch">
          <DropDownActions>
            <ActionImportReleaseCover />
            <ActionAddReleaseCover />
            <ActionDeleteRelease title={release.album} />
          </DropDownActions>
        </div>
        <CoverImage coverId={release.coverPath} releaseName={release.album} size={250} />
        <div className="flex flex-col justify-end gap-4 capitalize sm:gap-10">
          <span className="hidden sm:block">{release.releaseType.split(';')[0]}</span>
          <h1 className="text-center text-5xl font-bold sm:text-start">{release.album}</h1>
          <span className="text-center sm:text-start">{items.join(' • ')}</span>
        </div>
      </div>
      <div className="flex flex-col">
        {discs.map((tracks, index) => (
          <Fragment key={`disc-${tracks[0].libraryTrack?.disc ?? tracks[0].mbTrack?.disc}`}>
            {release.discTotal > 1 && index > 0 && <span className="border-primary border-t" />}
            {release.discTotal > 1 && (
              <div className="flex items-center gap-2 py-3 text-lg font-bold">
                <Disc3Icon size={32} />
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
