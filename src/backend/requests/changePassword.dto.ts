import { IsString } from 'class-validator';

export class ChangePasswordRequest {
  @IsString()
  currentPassword: string;

  @IsString()
  newPassword: string;
};
