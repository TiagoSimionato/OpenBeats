import type { ChangePasswordRequest } from 'backend/requests/changePassword.dto';
import { BadRequestError } from 'backend/exceptions/http';
import { userRepository } from 'backend/repositories/user.repository';
import * as bcrypt from 'bcrypt';

const getUser = async (username: string) => {
  const user = await userRepository.getUser(username);

  if (user) {
    const { password: _, ...rest } = user;
    return rest;
  }
};

const changeUserPassword = async (username: string, changePasswordRequest: ChangePasswordRequest) => {
  const user = await userRepository.getUser(username);
  if (!user) {
    throw new BadRequestError();
  }

  if (!bcrypt.compareSync(changePasswordRequest.currentPassword, user.password))
    throw new BadRequestError();

  user.password = await bcrypt.hash(changePasswordRequest.newPassword, 10);
  await userRepository.updateUser(user);
};

export const userService = {
  changeUserPassword,
  getUser,
};
