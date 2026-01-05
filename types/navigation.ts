export type ScreenItem = {
  id: number;
  title: string;
  path?: string;
};

export type SubMenuItem = {
  id: string;
  title: string;
  screens: ScreenItem[];
  path?: string;
};

export type MenuItem = {
  id: string;
  title: string;
  icon: string;
  color: string;
  feature?: string;
  subMenu: SubMenuItem[];
  path?: string;
};
