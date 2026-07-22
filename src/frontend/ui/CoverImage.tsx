import { Icon } from 'frontend/ui/Icon';
import { Disc3Icon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from './Button';
import { Dialog } from './Dialog';

type CoverProps = {
  className?: string;
  coverId?: string;
  coverURL?: string;
  fullSizeSrc?: string;
  iconFallback?: 'disc-album' | 'disc';
  releaseName: string;
  size?: number;
  withModal?: boolean;
};

const Cover = ({
  className,
  coverId,
  coverURL,
  iconFallback = 'disc',
  releaseName,
  size = 200,
}: CoverProps) => {
  if (!coverId && !coverURL) {
    if (iconFallback === 'disc')
      return <Disc3Icon className="scale-70 rounded" size={size} strokeWidth={1.25} />;
    return <Icon className="aspect-square" name="disc-album" size={size} />;
  }

  const coverSrc = coverURL ?? `/api/covers/${coverId}`;

  return (
    <Image
      alt={releaseName ? `${releaseName} cover art` : 'release cover art'}
      className={`object-contain ${className}`}
      height={size}
      loading={coverId ? 'eager' : 'lazy'}
      src={coverSrc}
      unoptimized={!!coverId}
      width={size}
    />
  );
};

const ModelCover = (props: CoverProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} size="xs" variant="tertiary">
        <Cover {...props} />
      </Button>
      <Dialog open={open} setOpen={setOpen}>
        <img
          alt={`${props.releaseName} cover art`}
          className="h-auto w-auto"
          src={props.fullSizeSrc}
        />
      </Dialog>
    </>
  );
};

export const CoverImage = (props: CoverProps) => {
  if (props.withModal) {
    return <ModelCover {...props} />;
  }
  return <Cover {...props} />;
};
