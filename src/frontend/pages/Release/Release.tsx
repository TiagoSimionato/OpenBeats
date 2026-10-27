'use client';

import type { LibraryReleaseData } from 'common/types/requests/library';
import type { ListTracks } from './components/TrackList';
import type { ReleasePageParams } from './type';
import { HttpStatusCode, isAxiosError } from 'axios';
import { mapMBResponseToTracks } from 'common/utils';
import { ROUTES } from 'configs/routes';
import { useGetLibraryRelease } from 'frontend/services/api/queries/library';
import { useMBGetRelease } from 'frontend/services/mbApi/queries/releases';
import { Divider } from 'frontend/ui/Divider';
import { Spinner } from 'frontend/ui/Spinner';
import { Disc3Icon } from 'lucide-react';
import { notFound, useParams, useRouter } from 'next/navigation';
import { Fragment } from 'react/jsx-runtime';
import { CoverImage } from '../../ui/CoverImage';
import { CoverPreview } from '../ReleaseSearch/components/CoverPreview';
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

  if (!release && isLibraryView)
    return notFound();

  if (isAxiosError(error) && error.status === HttpStatusCode.NotFound && isLibraryView)
    router.replace(ROUTES.HOME);

  const mbTracks = mbRelease ? mapMBResponseToTracks(mbRelease) : undefined;

  if (!release && !mbTracks) {
    return (
      <div className="flex grow items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  const info = {
    album: release?.album ?? mbTracks?.[0].album ?? '',
    albumArtist: release?.albumArtist ?? mbTracks?.[0].album_artist,
    discTotal: release?.discTotal ?? mbTracks?.[0].Disctotal ?? 0,
    originalYear: release?.originalYear ?? mbTracks?.[0].originalyear,
    releaseType: release?.releaseType ?? mbTracks?.[0]['MusicBrainz Album Type'] ?? '',
    trackCount: release?.trackCount ?? mbTracks?.[0].Tracktotal,
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

  const discs = Array.from({ length: info.discTotal })
    .fill(0)
    .map((_, index) =>
      listTracks.filter(
        ({ libraryTrack, mbTrack }) => (libraryTrack?.disc ?? mbTrack?.disc) === index + 1,
      ),
    );

  const items = [info.albumArtist, `${info.trackCount} tracks`, info.originalYear];

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="ml-auto flex items-start gap-4 pb-4 sm:order-last sm:self-stretch">
          <DropDownActions>
            <ActionImportReleaseCover />
            <ActionAddReleaseCover />
            <ActionDeleteRelease title={info.album} />
          </DropDownActions>
        </div>
        {release
          ? (
              <CoverImage coverId={release?.coverPath} releaseName={info.album} size={250} />
            )
          : (
              <CoverPreview releaseId={mbRelease?.id ?? ''} size={250} title={mbRelease?.title} />
            )}
        <div className="flex flex-col justify-end gap-4 capitalize sm:gap-10">
          <span className="hidden sm:block">{info.releaseType.split(';')[0]}</span>
          <h1 className="text-center text-5xl font-bold sm:text-start">{info.album}</h1>
          <span className="text-center sm:text-start">{items.join(' • ')}</span>
        </div>
      </div>
      <div className="flex flex-col">
        <MultiActions />
        {discs.map((tracks, index) => (
          <Fragment
            key={`disc-${tracks.reduce((acc, track) => acc.concat(track.libraryTrack?.title ?? track.mbTrack?.title ?? ''), index.toString())}`}
          >
            {info.discTotal > 1 && index > 0 && <Divider />}
            {info.discTotal > 1 && (
              <div className="flex items-center gap-2 py-3 text-lg font-bold">
                <Disc3Icon size={32} />
                <span>
                  Disc
                  {` ${index + 1}`}
                </span>
              </div>
            )}
            {info.discTotal > 1 && <Divider />}
            <TrackList tracks={tracks} />
          </Fragment>
        ))}
      </div>
      <About />
    </main>
  );
};
