import { HttpStatusCode } from 'axios';
import { userRepository } from 'backend/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { CONFIGS, CUSTOM_HEADERS } from 'configs/constants';
import { ROUTES } from 'configs/routes';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { NextResponse } from 'next/server';

export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    authorized: async ({ auth, request }) => {
      const origin = request.nextUrl.origin;
      if (!auth) {
        if (request.nextUrl.pathname.includes('/api'))
          return NextResponse.json({}, { status: HttpStatusCode.Unauthorized });

        const callbackUrl = request.nextUrl.pathname === '/' ? '' : `?callbackUrl=${encodeURI(request.nextUrl.pathname)}`;
        const newUrl = new URL(`${ROUTES.SIGN_IN}${callbackUrl}`, origin);
        return NextResponse.redirect(newUrl);
      }
      if (request.nextUrl.pathname === '/api/auth/signin' || request.nextUrl.pathname === '/api/auth/signout') {
        if (request.method === 'GET')
          return NextResponse.redirect(new URL(ROUTES.HOME, origin));
      }

      const headers = new Headers(request.headers);
      headers.set(CUSTOM_HEADERS.PATH_NAME, request.nextUrl.pathname);
      return NextResponse.next({ headers });
    },
  },
  providers: [Credentials({
    authorize: async (credentials) => {
      const username = typeof credentials.username === 'string' ? credentials.username : '';
      const password = typeof credentials.password === 'string' ? credentials.password : '';

      const user = await userRepository.getUser(username);
      if (!user) {
        return null;
      }

      if (bcrypt.compareSync(password, user.password)) {
        return {
          id: user.id,
          name: username,
        };
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
  trustHost: true,
});
