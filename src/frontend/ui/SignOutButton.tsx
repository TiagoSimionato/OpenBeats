'use client';

import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';

export const SignOutButton = () => (
  <button
    className="cursor-pointer text-sm"
    onClick={async () => {
      await signOut({
        redirect: false,
      });
      redirect('/signin');
    }}
  >
    Sign Out
  </button>
);
