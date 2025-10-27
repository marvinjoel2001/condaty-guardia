export interface ItemMenuProps {
  screen?: string | null;
  text: string;
  onPress?: any;
  icon?: string;
  color?: string;
  colorText?: string;
  activeItem?: string;
  reverse?: boolean;
}