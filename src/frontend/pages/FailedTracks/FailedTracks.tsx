'use client';

import { ROUTES } from 'configs/routes';
import { useGetFailedTracks } from 'frontend/services/api/queries/failedTracks';
import { Checkbox } from 'frontend/ui/Checkbox';
import { CoverImage } from 'frontend/ui/CoverImage';
import { GoBack } from 'frontend/ui/GoBack';
import Link from 'next/link';
import { ActionDeleteFailedTrack } from './components/ActionDeleteFailedTrack';
import { ActionRetry } from './components/ActionRetry';
import { ActionRetryAll } from './components/ActionRetryAll';
import { FailedTracksSelection } from './components/FailedTracksSelection';
import { NoFailedTracksFound } from './components/NoFailedTracksFound';
import { useFailedTracksStore } from './components/useFailedTracksStore';

export const FailedTracksPage = () => {
  const { data: failedTracks } = useGetFailedTracks();
  const {
    addFailedTrack,
    failedTracks: failedTracksStore,
    removeFailedTrack,
  } = useFailedTracksStore();

  return (
    <>
      <div className="flex items-center gap-4 pb-8">
        <GoBack href={ROUTES.MANAGEMENT} />
        <h2 className="text-3xl font-semibold">Failed Tracks</h2>
        <ActionRetryAll className="ml-auto" />
      </div>
      <FailedTracksSelection />
      {failedTracks?.length === 0 && <NoFailedTracksFound />}
      <div className="flex flex-col">
        {failedTracks?.map(failedTrack => (
          <div
            className="-mx-4 flex flex-wrap items-center justify-between gap-4 rounded-md p-4 hover:bg-white/20 sm:mx-0 sm:flex-nowrap"
            key={failedTrack.trackId}
          >
            <Checkbox
              checked={failedTracksStore.some(
                it =>
                  it.trackId === failedTrack.trackId && it.releaseId === failedTrack.releaseId,
              )}
              className="text-white"
              onChange={(event) => {
                if (event.target.checked)
                  addFailedTrack(failedTrack);
                if (!event.target.checked)
                  removeFailedTrack(failedTrack);
              }}
            />
            <CoverImage
              className="min-w-25"
              releaseId={failedTrack.releaseId}
              releaseName={failedTrack.title}
              size={100}
            />
            <Link
              className="order-last flex grow items-center justify-around gap-4 self-stretch sm:order-0 sm:flex-row"
              href={ROUTES.SEARCH_DETAILS(failedTrack.releaseId)}
            >
              {[failedTrack.title, failedTrack.artist, failedTrack.reason].map(it => (
                <p
                  className="line-clamp-2 w-1/3 text-center"
                  key={`${it}-${Math.random().toString()}`}
                >
                  {it}
                </p>
              ))}
            </Link>
            <div className="flex grow items-center justify-around gap-4 self-stretch sm:grow-0 sm:flex-row">
              <ActionRetry {...failedTrack} />
              <ActionDeleteFailedTrack {...failedTrack} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
