import { useGetLibraryCover } from 'frontend/services/api/queries/library';
import { useCover } from 'frontend/services/caaApi/queries/covers';
import { Icon } from 'frontend/ui/Icon';
import { Disc3Icon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { Spinner } from './Spinner';

type CoverProps = {
  className?: string;
  iconFallback?: 'disc-album' | 'disc';
  releaseId: string;
  releaseName?: string;
  size?: number;
  withoutCaaFallback?: boolean;
  withoutModal?: boolean;
};

export const CAAImage = ({ className, ...props }: CoverProps) => {
  const { data, isPending } = useCover({
    releaseId: props.releaseId,
  });

  const frontImage = data?.images?.find(image => image.front) ?? data?.images?.[0];
  const coverSrc
    = frontImage?.thumbnails?.small ?? frontImage?.thumbnails?.[250] ?? frontImage?.image;

  if (isPending) {
    return (
      <div className="flex aspect-square items-center justify-center" style={{ width: props.size }}>
        <Spinner size="xl" />
      </div>
    );
  }

  if (!coverSrc) {
    if (props.iconFallback === 'disc')
      return <Disc3Icon className="scale-70 rounded" size={props.size} strokeWidth={1.25} />;
    return <Icon className="aspect-square" name="disc-album" size={props.size} />;
  }

  return (
    <Image
      alt={props.releaseName ? `${props.releaseName} cover art` : 'release cover art'}
      className={className}
      height={props.size}
      loading="lazy"
      src={coverSrc}
      unoptimized={!!props.releaseId}
      width={props.size}
    />
  );
};

const Cover = ({ size = 200, withoutCaaFallback, ...props }: CoverProps) => {
  const { isError } = useGetLibraryCover({ releaseId: props.releaseId });

  if (isError && !withoutCaaFallback) {
    return <CAAImage size={size} {...props} />;
  }

  if (isError) {
    if (props.iconFallback === 'disc')
      return <Disc3Icon className="scale-70 rounded" size={size} strokeWidth={1.25} />;
    return <Icon className="aspect-square" name="disc-album" size={size} />;
  }

  return (
    <Image
      alt={props.releaseName ? `${props.releaseName} cover art` : 'release cover art'}
      className={props.className}
      height={size}
      loading="eager"
      src={`/api/covers/${props.releaseId}`}
      unoptimized={!!props.releaseId}
      width={size}
    />
  );
};

const ModalCover = (props: CoverProps) => {
  const [open, setOpen] = useState(false);
  const { data, isPending } = useCover({
    releaseId: props.releaseId,
  });
  const frontImage = data?.images?.find(image => image.front) ?? data?.images?.[0];

  return (
    <>
      <Button onClick={() => setOpen(true)} size="xs" variant="tertiary">
        <Cover {...props} />
      </Button>
      <Dialog open={open} setOpen={setOpen}>
        {!isPending && (
          <Image
            alt={props.releaseName ? `${props.releaseName} cover art` : 'release cover art'}
            className="h-auto max-h-[calc(100dvh-186px)] w-auto"
            height={1080}
            loading="lazy"
            src={`${frontImage?.image}`}
            unoptimized
            width={1080}
          />
        )}
      </Dialog>
    </>
  );
};

export const CoverImage = (props: CoverProps) => {
  if (props.withoutModal) {
    return <Cover {...props} />;
  }
  return <ModalCover {...props} />;
};
