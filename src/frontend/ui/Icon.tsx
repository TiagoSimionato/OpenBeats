import Image from 'next/image';

type IconProps = {
  className?: string;
  name: 'disc-album' | 'disc';
};

export const Icon = ({ className, name }: IconProps) => (
  <Image
    alt={`${name}} icon`}
    className={className}
    height={32}
    loading="eager"
    src={`/${name}.svg`}
    width={32}
  />
);
