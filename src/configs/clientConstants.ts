'use client';

export const ROUTES = {
  HOME: '/',
  RELEASE: (id: string) => `/releases/${id}`,
  SEARCH: '/search',
  SIGN_IN: '/signin',
};
