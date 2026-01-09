import { ROLE_KEYS } from '@/navigation/roles';
import { RoleSchema } from '@/schema/role';

export const RoleEnum = RoleSchema.enum;

export type TRoleKey = keyof typeof ROLE_KEYS;

export type TRoleValue = (typeof ROLE_KEYS)[TRoleKey];
