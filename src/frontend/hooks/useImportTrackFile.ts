import type { ReleasePageParams } from 'frontend/pages/Release/type';
import { useQueueContext } from 'frontend/contexts/QueueContext';
import { useImportTrack } from 'frontend/services/api/mutations/library';
import { useParams } from 'next/navigation';

export const useImportTrackFile = () => {
  const { releaseId } = useParams<ReleasePageParams>();
  const { enqueueJob } = useQueueContext();
  const { mutateAsync: importTrack } = useImportTrack();

  const handleImportFile = ({ file, title, trackId }: { file: File; title: string; trackId: string }) => {
    const formData = new FormData();
    formData.append('file', file);

    enqueueJob({
      id: trackId,
      onStart: () =>
        importTrack({
          formData,
          releaseId,
          trackId,
        }),
      title,
      totalTracks: 1,
    });
  };

  return { handleImportFile };
};
