import { randomUUID } from 'node:crypto';
import { dbService } from 'backend/services/db.service';
import * as bcrypt from 'bcrypt';
import { CONFIGS } from 'configs/constants';

const createDDL = async () => {
  const database = await dbService.getDatabase();

  database.exec(`
    CREATE TABLE IF NOT EXISTS tb_users (
      id UUID PRIMARY KEY NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );`);
};

type User = {
  id: string;
  password: string;
  username: string;
};

const createUser = async (user: User) => {
  await dbService.dbExec(`
    INSERT INTO tb_users (
      id,
      username,
      password
    ) VALUES (
      @id,
      @username,
      @password
    );
  `, user);
};

const updateUser = async (user: User) => {
  await dbService.dbExec(`
    UPDATE tb_users
    SET
      username = @username,
      password = @password
    WHERE id = @id;
  `, user);
};

const getUser = async (username: string) => {
  const user = dbService.get<User>(`
    SELECT *
    FROM tb_users
    WHERE username = ?;`, username);

  return user;
};

const createDefaultUser = async () => {
  const password = CONFIGS.DEFAULT_PASSWORD ?? Math.random().toString(36).substring(2);

  const user: User = {
    id: randomUUID(),
    password: await bcrypt.hash(password, 10),
    username: CONFIGS.DEFAULT_USER,
  };

  await createUser(user);
  console.log(`created default user [${CONFIGS.DEFAULT_USER}] with password [${password}]`);
};

export const userRepository = {
  createDDL,
  createDefaultUser,
  createUser,
  getUser,
  updateUser,
};
