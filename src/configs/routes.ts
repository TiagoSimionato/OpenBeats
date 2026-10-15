export const ROUTES = {
  HOME: '/',
  RELEASE: (id: string) => `/releases/${id}`,
  SEARCH: '/search',
  SEARCH_DETAILS: (id: string) => `/search/${id}`,
  SETTINGS: '/settings',
  SIGN_IN: '/signin',
};
