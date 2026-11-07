export type User = {
  id: string;
  password: string;
  username: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};
