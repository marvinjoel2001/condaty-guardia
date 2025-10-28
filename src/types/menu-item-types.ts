export interface ItemMenuProps {
  screen?: string | null;
  text: string;
  onPress?: (() => void) | any;
  icon?: any;
  color?: string;
  colorText?: string;
  activeItem?: string;
  reverse?: boolean;
}