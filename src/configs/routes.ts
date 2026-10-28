export const ROUTES = {
  FAILED_TRACKS: '/management/failedTracks',
  HOME: '/',
  MANAGEMENT: '/management',
  RELEASE: (id: string) => `/releases/${id}`,
  SEARCH: '/search',
  SEARCH_DETAILS: (id: string) => `/search/${id}`,
  SIGN_IN: '/signin',
};
