import { GenericAPI } from '../api/index';

export const mbApi = GenericAPI('https://musicbrainz.org/ws/2/', {
  params: {
    fmt: 'json',
  },
});

export * from './queries';
