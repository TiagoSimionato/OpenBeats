'use client';

import { getSession, signIn } from 'next-auth/react';
import { redirect, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export const SignInPage = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';
  const session = getSession();

  useEffect(() => {
    session.then((e) => {
      if (e)
        redirect('/');
    });
  // eslint-disable-next-line react/exhaustive-deps
  }, []);

  return (
    <form
      action={async (formData) => {
        const { error } = await signIn('credentials', {
          password: formData.get('password')?.toString() ?? '',
          redirect: false,
          username: formData.get('username')?.toString() ?? '',
        });
        if (!error)
          redirect(callbackUrl);
      }}
      className="flex-col flex p-10 gap-4"
    >
      <label htmlFor="username">
        Username
      </label>
      <input className="border-amber-50 border-2 rounded-md" id="username" name="username" type="text" />
      <label htmlFor="password">
        Password
      </label>
      <input className="border-amber-50 border-2 rounded-md" id="password" name="password" type="password" />
      <button>Sign In</button>
    </form>
  );
};
