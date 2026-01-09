import { z } from 'zod';
import { RoleSchema } from './role';

export const UserTypeEnum = z.enum([
  'STANDARD', // Regular user
  'ADMIN', // Administrator
  'SERVICE', // Service account
  'GUEST', // Guest/limited access user
]);

export const UserStatusEnum = z.enum([
  'ACTIVE', // User is active
  'INACTIVE', // User is deactivated
  'PENDING', // Awaiting verification
  'SUSPENDED', // Temporarily suspended
]);

export const PasswordStatusEnum = z.enum([
  'DEFAULT_MANDATORY_CHANGE', // Password requires immediate change
  'USER_DEFINED', // User has set a meaningful password
]);

export const UserSchema = z.object({
  id: z
    .string()
    .min(1, 'User ID must have at least one character')
    .describe('The unique user identifier.'),
  name: z.string().min(1, 'User name must have at least one character'),
  type: UserTypeEnum.describe('The type of user account, e.g., STANDARD, ADMIN.'),
  roles: z.array(RoleSchema).min(1, 'User must have at least one role'),
  current_status: UserStatusEnum.describe('Current status (Active, Inactive, Pending, Suspended).'),
  password_status: PasswordStatusEnum.describe(
    'Indicates if the user must change their initial/reset password.'
  ),
  password_hash: z.string().describe('Hashed password for authentication.'),
  created_at: z
    .preprocess(
      (val) => (typeof val === 'string' || val instanceof Date ? new Date(val) : val),
      z.date()
    )
    .optional(),
  updated_at: z
    .preprocess(
      (val) => (typeof val === 'string' || val instanceof Date ? new Date(val) : val),
      z.date()
    )
    .nullable()
    .optional(),
  deleted_at: z
    .preprocess(
      (val) => (typeof val === 'string' || val instanceof Date ? new Date(val) : val),
      z.date()
    )
    .nullable()
    .optional(),
});

export const CreateUserSchema = UserSchema;

export const UpdateUserSchema = UserSchema.partial().extend({
  id: z.string().optional(),
});

export const UserResponseSchema = UserSchema.extend({
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});
