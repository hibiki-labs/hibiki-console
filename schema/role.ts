import z from 'zod';
import { ROLE_KEYS } from '@/navigation/roles';

// Extract values from ROLE_KEYS object as a tuple for Zod enum
const roleValues = Object.values(ROLE_KEYS) as [string, ...string[]];

export const RoleSchema = z.enum(roleValues);
