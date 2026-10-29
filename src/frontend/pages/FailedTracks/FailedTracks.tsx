'use client';

import { ROUTES } from 'configs/routes';
import { useGetFailedTracks } from 'frontend/services/api/queries/failedTracks';
import { Checkbox } from 'frontend/ui/Checkbox';
import { GoBack } from 'frontend/ui/GoBack';
import Link from 'next/link';
import { CoverPreview } from '../ReleaseSearch/components/CoverPreview';
import { ActionDeleteFailedTrack } from './components/ActionDeleteFailedTrack';
import { ActionRetry } from './components/ActionRetry';

export const FailedTracksPage = () => {
  const { data: failedTracks } = useGetFailedTracks();

  return (
    <>
      <div className="pb-8">
        <GoBack href={ROUTES.MANAGEMENT} />
      </div>
      <div className="flex flex-col">
        {failedTracks?.map(track => (
          <div
            className="flex items-center justify-between gap-4 rounded-md p-4 hover:bg-white/20"
            key={track.trackId}
          >
            <Checkbox />
            <CoverPreview releaseId={track.releaseId} size={100} title={track.title} />
            <Link
              className="flex grow flex-col items-center justify-around gap-4 self-stretch md:flex-row"
              href={ROUTES.SEARCH_DETAILS(track.releaseId)}
            >
              {[track.title, track.artist, track.reason].map(it => (
                <p className="md:w-1/3 md:text-center" key={`${it}-${Math.random().toString()}`}>
                  {it}
                </p>
              ))}
            </Link>
            <ActionRetry {...track} />
            <ActionDeleteFailedTrack {...track} />
          </div>
        ))}
      </div>
    </>
  );
};
