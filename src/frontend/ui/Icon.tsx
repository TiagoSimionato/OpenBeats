import Image from 'next/image';

type IconProps = {
  className?: string;
  name: 'disc-album' | 'disc' | 'search-off' | 'search';
  size?: number;
};

export const Icon = ({ className, name, size }: IconProps) => (
  <Image
    alt={`${name}} icon`}
    className={className}
    height={size ?? 32}
    loading="eager"
    src={`/${name}.svg`}
    width={size ?? 32}
  />
);
