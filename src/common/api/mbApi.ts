import { createAPI } from 'tsm-utils';

export const MUSICBRAINZ_RELEASE_PARAMS = {
  inc: 'media+recordings+artist-credits+release-groups+labels+tags',
};

export const mbApi = createAPI('https://musicbrainz.org/ws/2/', {
  params: {
    fmt: 'json',
  },
});
