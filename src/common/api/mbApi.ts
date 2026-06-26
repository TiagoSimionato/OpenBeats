import { createAPI } from 'tsm-utils';

export const mbApi = createAPI('https://musicbrainz.org/ws/2/', {
  params: {
    fmt: 'json',
  },
});
