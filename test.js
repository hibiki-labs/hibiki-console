const menu = [
  {
    title: 'Menu 1',
    subMenu: [
      {
        title: 'Sub Menu 11',
        screens: [
          { id: 111, title: 'Screen 111' },
          { id: 112, title: 'Screen 112' },
        ],
      },
      {
        title: 'Sub Menu 12',
        screens: [
          { id: 121, title: 'Screen 121' },
          { id: 122, title: 'Screen 122' },
        ],
      },
      {
        title: 'Sub Menu 13',
        screens: [
          { id: 131, title: 'Screen 131' },
          { id: 132, title: 'Screen 132' },
        ],
      },
    ],
  },
  {
    title: 'Menu 2',
    subMenu: [
      {
        title: 'Sub Menu 21',
        screens: [
          { id: 211, title: 'Screen 211' },
          { id: 212, title: 'Screen 212' },
        ],
      },
      {
        title: 'Sub Menu 22',
        screens: [
          { id: 221, title: 'Screen 221' },
          { id: 222, title: 'Screen 222' },
        ],
      },
    ],
  },
];

const rolesRegistry = {
  'chai-wala-chotu': {
    accessibleScreenIds: new Set([111, 121, 222]),
  },
  teller: {
    accessibleScreenIds: new Set([221, 122]),
  },
  'guard-sahab': {
    accessibleScreenIds: new Set([211]),
  },
};

const user = {
  roles: ['chai-wala-chotu', 'teller'],
};

function getFilteredMenu(user) {
  const filteredMenu = [];

  let allAccessibleScreenIds = new Set();
  for (const role of user.roles) {
    const accessibleScreenIdsForRole = rolesRegistry[role].accessibleScreenIds;
    allAccessibleScreenIds = allAccessibleScreenIds.union(accessibleScreenIdsForRole);
  }

  // Filter the menu tree based on accessible screens
  for (const menuItem of menu) {
    const filteredSubMenu = [];

    for (const subMenuItem of menuItem.subMenu) {
      // Check if any screen in this submenu is accessible
      const accessibleScreensInSubMenu = subMenuItem.screens.filter((screen) =>
        allAccessibleScreenIds.has(screen.id)
      );

      // Only include submenu if it has at least one accessible screen
      if (accessibleScreensInSubMenu.length > 0) {
        filteredSubMenu.push({
          title: subMenuItem.title,
          screens: accessibleScreensInSubMenu,
        });
      }
    }

    // Only include menu item if it has at least one submenu with accessible screens
    if (filteredSubMenu.length > 0) {
      filteredMenu.push({
        title: menuItem.title,
        subMenu: filteredSubMenu,
      });
    }
  }

  return filteredMenu;
}

function hasAccess(user, screenId) {
  for (const role of user.roles) {
    if (rolesRegistry[role].accessibleScreenIds.has(screenId)) {
      return true;
    }
  }
  return false;
}

console.log(JSON.stringify(getFilteredMenu(user), null, 2));
console.log(5678, hasAccess(user, 5678));
console.log(345534, hasAccess(user, 345534));
