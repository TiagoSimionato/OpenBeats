import type { Track } from 'common/types/requests/releases';
import { prisma } from 'backend/prisma/prisma';

export const trackRepository = prisma.track;

export const upsertTrack = async (track: Track) => {
  const libraryTrack = {
    artist: track.artist,
    artistSort: track['artist-sort'],
    disc: track.disc,
    downloadPath: track.trackPath ?? '',
    genre: track.genre.join('; '),
    id: track['MusicBrainz Track Id'],
    musicBrainzReleaseTrackId: track['MusicBrainz Release Track Id'],
    musicBrainzTrackId: track['MusicBrainz Track Id'],
    releaseId: track['MusicBrainz Album Id'],
    title: track.title,
    trackNumber: track.track,
    ts02: track.TSO2,
  };
  await trackRepository.upsert({
    create: libraryTrack,
    update: libraryTrack,
    where: { id: libraryTrack.id },
  });
};
