import { TRoleValue } from '@/types/role';
import { TUser } from '@/types/user';
import { ROLES } from './roles';

export function hasAccess(user: TUser, feature: string) {
  for (const role of user.roles) {
    const roleConfig = ROLES[role as TRoleValue];
    if (roleConfig.accessibleFeatures.has('*')) {
      return true;
    }
    if (roleConfig.accessibleFeatures.has(feature)) {
      return true;
    }
  }
  return false;
}
