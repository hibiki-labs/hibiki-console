import { z } from 'zod';
import {
  CreateUserSchema,
  PasswordStatusEnum,
  UpdateUserSchema,
  UserResponseSchema,
  UserSchema,
  UserStatusEnum,
  UserTypeEnum,
} from '@/schema/user';

export const UserType = UserTypeEnum.enum;

export const UserStatus = UserStatusEnum.enum;

export const PasswordStatus = PasswordStatusEnum.enum;

export type TUser = z.infer<typeof UserSchema>;

export type TCreateUser = z.infer<typeof CreateUserSchema>;

export type TUpdateUser = z.infer<typeof UpdateUserSchema>;

export type TUserResponse = z.infer<typeof UserResponseSchema>;
