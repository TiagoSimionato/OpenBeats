import { Icon } from 'frontend/ui/Icon';
import { Disc3Icon } from 'lucide-react';
import Image from 'next/image';

type CoverProps = {
  className?: string;
  coverId?: string;
  coverURL?: string;
  iconFallback?: 'disc-album' | 'disc';
  releaseName: string;
  size?: number;
};

export const CoverImage = ({
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
