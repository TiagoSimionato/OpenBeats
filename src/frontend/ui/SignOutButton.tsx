'use client';

import type { ButtonProps } from './Button';
import { ROUTES } from 'configs/routes';
import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from './Button';

type SignOutButtonProps = ButtonProps;

export const SignOutButton = ({ className, ...rest }: SignOutButtonProps) => (
  <Button
    className={`font-normal ${className}`}
    onClick={async () => {
      await signOut({
        redirect: false,
      });
      redirect(ROUTES.SIGN_IN);
    }}
    size="xs"
    variant="tertiary"
    {...rest}
  >
    Sign Out
  </Button>
);
