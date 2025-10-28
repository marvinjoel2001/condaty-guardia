import { ItemMenuProps } from './menu-item-types';
import { User } from './user-types';

export type MenuProps = {
  menuItems: ItemMenuProps[];
  activeItem?: string;
  user: User | null;
  store: any;
  setStore: Function;
};