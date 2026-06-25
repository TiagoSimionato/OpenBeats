import { GenericAPI } from './generic';

export const mbApi = GenericAPI('https://musicbrainz.org/ws/2/', {
  params: {
    fmt: 'json',
  },
});
