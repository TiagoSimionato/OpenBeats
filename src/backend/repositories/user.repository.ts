import { prisma } from 'backend/prisma/prisma';
import * as bcrypt from 'bcrypt';
import { CONFIGS } from 'configs/constants';

export const createDefaultUser = async () => {
  const password = CONFIGS.DEFAULT_PASSWORD ?? Math.random().toString(36).substring(2);

  await prisma.user.create({
    data: {
      password: await bcrypt.hash(password, 10),
      username: CONFIGS.DEFAULT_USER,
    },
  });

  console.log(`created default user [${CONFIGS.DEFAULT_USER}] with password [${password}]`);
};

export const userRepository = prisma.user;
