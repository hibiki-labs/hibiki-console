export type ScreenItem = {
  id: number;
  title: string;
};

export type SubMenuItem = {
  id: string;
  title: string;
  screens: ScreenItem[];
};

export type MenuItem = {
  id: string;
  title: string;
  icon: string;
  color: string;
  feature?: string;
  subMenu: SubMenuItem[];
};
