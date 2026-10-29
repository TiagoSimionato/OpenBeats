'use client';

import { ROUTES } from 'configs/routes';
import { useGetFailedTracks } from 'frontend/services/api/queries/failedTracks';
import { Button } from 'frontend/ui/Button';
import { Checkbox } from 'frontend/ui/Checkbox';
import { GoBack } from 'frontend/ui/GoBack';
import { CoverPreview } from '../ReleaseSearch/components/CoverPreview';
import { ActionDeleteFailedTrack } from './components/ActionDeleteFailedTrack';

export const FailedTracksPage = () => {
  const { data: failedTracks } = useGetFailedTracks();

  return (
    <>
      <div className="pb-8">
        <GoBack href={ROUTES.MANAGEMENT} />
      </div>
      <div className="flex flex-col gap-8">
        {failedTracks?.map(track => (
          <div className="flex items-center justify-between gap-4" key={track.trackId}>
            <Checkbox />
            <CoverPreview releaseId={track.releaseId} size={100} title={track.title} />
            <div className="flex grow flex-col justify-around gap-4 md:flex-row">
              {[track.title, track.artist, track.reason].map(it => (
                <p className="md:w-1/3 md:text-center" key={`${it}-${Math.random().toString()}`}>
                  {it}
                </p>
              ))}
            </div>
            <Button size="lg" variant="secondary">
              Retry
            </Button>
            <ActionDeleteFailedTrack {...track} />
          </div>
        ))}
      </div>
    </>
  );
};
