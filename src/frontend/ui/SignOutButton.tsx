'use client';

import { ROUTES } from 'configs/routes';
import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';

export const SignOutButton = () => (
  <button
    className="cursor-pointer text-sm"
    onClick={async () => {
      await signOut({
        redirect: false,
      });
      redirect(ROUTES.SIGN_IN);
    }}
  >
    Sign Out
  </button>
);
