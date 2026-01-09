export const ROLE_KEYS = {
  SUPER_ADMIN: 'super-admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  VIEWER: 'viewer',
  AUDITOR: 'auditor',
} as const;

type TRoleKey = keyof typeof ROLE_KEYS;
type TRoleValue = (typeof ROLE_KEYS)[TRoleKey];
type FeatureOrStar = string | '*';

export const ROLES: Record<TRoleValue, { name: string; accessibleFeatures: Set<FeatureOrStar> }> = {
  'super-admin': {
    name: 'Super Admin',
    accessibleFeatures: new Set<FeatureOrStar>(['*']),
  },
  admin: {
    name: 'Administrator',
    accessibleFeatures: new Set<FeatureOrStar>([
      'users',
      'settings',
      'reports',
      'dashboard',
      'profile',
    ]),
  },
  manager: {
    name: 'Manager',
    accessibleFeatures: new Set<FeatureOrStar>(['users', 'reports', 'dashboard', 'profile']),
  },
  user: {
    name: 'Standard User',
    accessibleFeatures: new Set<FeatureOrStar>(['dashboard', 'profile']),
  },
  viewer: {
    name: 'Viewer',
    accessibleFeatures: new Set<FeatureOrStar>(['dashboard']),
  },
  auditor: {
    name: 'Auditor',
    accessibleFeatures: new Set<FeatureOrStar>(['reports', 'dashboard']),
  },
};
