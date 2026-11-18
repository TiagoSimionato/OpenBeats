import 'reflect-metadata';

export const register = async () => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('configs/loggger');

    const { dbService } = await import('backend/services/db.service');
    await dbService.initDatabase();

    const { prisma } = await import('backend/prisma/prisma');

    const users = await prisma.user.findMany();
    if (users.length === 0) {
      const { createDefaultUser } = await import('backend/repositories/user.repository');
      createDefaultUser();
    }

    const releases = await prisma.release.findMany();
    if (releases.length === 0) {
      const { libraryManagerService } = await import('backend/services/library');
      libraryManagerService.scanner.scanLibrary();
    }
  }
};
