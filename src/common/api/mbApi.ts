import { createAPI } from './createAPI';

export const mbApi = createAPI('https://musicbrainz.org/ws/2/', {
  params: {
    fmt: 'json',
  },
});
