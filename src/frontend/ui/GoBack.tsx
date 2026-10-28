import type { LinkProps } from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

type GoBackProps = LinkProps;

export const GoBack = (props: GoBackProps) => (
  <Link {...props}>
    <ArrowLeftIcon />
  </Link>
);
