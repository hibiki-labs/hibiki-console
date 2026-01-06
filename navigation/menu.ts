'use server';

import { MenuItem } from '@/types/navigation';
import { TUser } from '@/types/user';
import { ROLES } from './roles';

const menu: MenuItem[] = [
  {
    id: '1',
    title: 'Dashboard',
    icon: 'IconDashboard',
    color: 'blue',
    feature: 'dashboard',
    path: '/dashboard/sources',
    subMenu: [
      {
        id: '1',
        title: 'Overview',
        path: '/dashboard/sources',
        screens: [{ id: 1001, title: 'Dashboard Overview' }],
      },
      {
        id: '2',
        title: 'Analytics',
        screens: [{ id: 1002, title: 'Analytics Dashboard' }],
      },
      {
        id: '3',
        title: 'Activity Feed',
        screens: [{ id: 1003, title: 'Recent Activity' }],
      },
      {
        id: '4',
        title: 'Sources',
        path: '/dashboard/sources',
        screens: [{ id: 1004, title: 'Manage Sources' }],
      },
    ],
  },

  {
    id: '2',
    title: 'Users',
    icon: 'IconUsers',
    color: 'cyan',
    feature: 'users',
    subMenu: [
      {
        id: '1',
        title: 'User List',
        screens: [{ id: 2001, title: 'All Users' }],
      },
      {
        id: '2',
        title: 'Create User',
        screens: [{ id: 2002, title: 'New User' }],
      },
      {
        id: '3',
        title: 'User Roles',
        screens: [{ id: 2003, title: 'Manage Roles' }],
      },
      {
        id: '4',
        title: 'User Groups',
        screens: [{ id: 2004, title: 'Manage Groups' }],
      },
    ],
  },

  {
    id: '3',
    title: 'Profile',
    icon: 'IconUser',
    color: 'teal',
    feature: 'profile',
    subMenu: [
      {
        id: '1',
        title: 'My Profile',
        screens: [{ id: 3001, title: 'View Profile' }],
      },
      {
        id: '2',
        title: 'Edit Profile',
        screens: [{ id: 3002, title: 'Edit Profile Details' }],
      },
      {
        id: '3',
        title: 'Change Password',
        screens: [{ id: 3003, title: 'Password Change' }],
      },
      {
        id: '4',
        title: 'Preferences',
        screens: [{ id: 3004, title: 'User Preferences' }],
      },
    ],
  },

  {
    id: '4',
    title: 'Settings',
    icon: 'IconSettings',
    color: 'green',
    feature: 'settings',
    subMenu: [
      {
        id: '1',
        title: 'General Settings',
        screens: [{ id: 4001, title: 'General Configuration' }],
      },
      {
        id: '2',
        title: 'Security',
        screens: [{ id: 4002, title: 'Security Settings' }],
      },
      {
        id: '3',
        title: 'Notifications',
        screens: [{ id: 4003, title: 'Notification Settings' }],
      },
      {
        id: '4',
        title: 'Integrations',
        screens: [{ id: 4004, title: 'Third-Party Integrations' }],
      },
    ],
  },

  {
    id: '5',
    title: 'Reports',
    icon: 'IconReport',
    color: 'orange',
    feature: 'reports',
    subMenu: [
      {
        id: '1',
        title: 'User Reports',
        screens: [{ id: 5001, title: 'User Activity Report' }],
      },
      {
        id: '2',
        title: 'System Reports',
        screens: [{ id: 5002, title: 'System Usage Report' }],
      },
      {
        id: '3',
        title: 'Audit Logs',
        screens: [{ id: 5003, title: 'Audit Trail' }],
      },
      {
        id: '4',
        title: 'Export Data',
        screens: [{ id: 5004, title: 'Data Export' }],
      },
    ],
  },
];

export async function getFilteredMenu(user: Pick<TUser, 'roles'>) {
  const filteredMenu: MenuItem[] = [];

  let allAccessibleFeatures = new Set<string>();
  for (const role of user.roles) {
    const roleConfig = ROLES[role as keyof typeof ROLES];
    if (roleConfig) {
      allAccessibleFeatures = allAccessibleFeatures.union(roleConfig.accessibleFeatures);
    }
  }

  if (allAccessibleFeatures.has('*')) {
    return menu;
  }

  // Filter the menu tree based on accessible features
  for (const menuItem of menu) {
    if (menuItem.feature && allAccessibleFeatures.has(menuItem.feature)) {
      filteredMenu.push(menuItem);
    }
  }

  return filteredMenu;
}
