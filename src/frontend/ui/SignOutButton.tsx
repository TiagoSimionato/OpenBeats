'use client';

import { ROUTES } from 'configs/routes';
import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from './Button';

export const SignOutButton = () => (
  <Button
    className="font-normal"
    onClick={async () => {
      await signOut({
        redirect: false,
      });
      redirect(ROUTES.SIGN_IN);
    }}
    size="xs"
    variant="tertiary"
  >
    Sign Out
  </Button>
);
