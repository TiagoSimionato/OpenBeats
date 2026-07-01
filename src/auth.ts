import { HttpStatusCode } from 'axios';
import { CONFIGS } from 'configs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { NextResponse } from 'next/server';

export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    authorized: async ({ auth, request }) => {
      if (!auth) {
        if (request.nextUrl.pathname.includes('/api'))
          return NextResponse.json({}, { status: HttpStatusCode.Unauthorized });

        const callbackUrl = request.nextUrl.pathname === '/' ? '' : `?callbackUrl=${encodeURI(request.nextUrl.pathname)}`;
        const newUrl = new URL(`/signin${callbackUrl}`, request.nextUrl.origin);
        return NextResponse.redirect(newUrl);
      }
      return !!auth;
    },
  },
  providers: [Credentials({
    authorize: (credentials) => {
      if (credentials.username === CONFIGS.DEFAULT_USER && credentials.password === CONFIGS.DEFAULT_PASSWORD) {
        const user = {
          name: credentials.username,
        };
        return user;
      }
      return null;
    },
    credentials: {
      password: {},
      username: {},
    },
  })],
  secret: CONFIGS.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
});
