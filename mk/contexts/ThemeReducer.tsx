import {ViewStyle, TextStyle} from "react-native";
import {themes} from "../styles/themes";

export interface TypeProps extends ViewStyle, TextStyle {}

type ModalType = {
  overlay: TypeProps;
  container: TypeProps;
  header: TypeProps;
  headerText: TypeProps;
  body: TypeProps;
  footer: TypeProps;
};

export type PaletteType = {
  color: string;
  v1?: string;
  v2?: string;
  v3?: string;
  bg?: string;
};

type ThemeAction =
  | {type: "set_light_theme"}
  | {type: "set_dark_theme"}
  | {type: "set_custom_theme"};

export type PalleteThemeType = {
  dark?: ColorType;
  light?: ColorType;
  custom?: ColorType;
  global?: {
    heightFooter: number;
    radius: number;
    pruebas: any;
  };
};
export type ColorType = {
  accent: PaletteType;
  dark: PaletteType;
  light: PaletteType;
  warning?: string;
  error?: string;
  success?: string;
  info?: string;
  hightAlert?: string;
  mediumAlert?: string;
  lowAlert?: string;
};
export type ButtonsType = {
  button: TypeProps;
  primary?: TypeProps;
  secondary?: TypeProps;
  disabled?: TypeProps;
  icon?: TypeProps;
};

export type CheckType = {
  backgroundColor?: string;
  borderWidth?: number;
  color?: string;
  maxHeight?: number;
};

export interface ThemeState {
  currentTheme: "light" | "dark" | "custom";
  divideColor?: string;
  backgroundColor?: string;
  pruebas?: TypeProps;
  form?: {
    color?: string;
    placeholderColor?: string;
    bg?: string;
    label: {
      default?: TypeProps;
      error?: TypeProps;
      focus?: TypeProps;
      disabled?: TypeProps;
    };
    input: {
      default?: TypeProps;
      error?: TypeProps;
      focus?: TypeProps;
      disabled?: TypeProps;
    };
    select: {
      selectText?: TypeProps;
      selectRow?: TypeProps;
      selectRowText?: TypeProps;
      conteinerRow?: TypeProps;
      selectedRow?: TypeProps;
    };
    checks: {
      check?: CheckType;
    };
  };
  card?: {
    container: TypeProps;
    label: TypeProps;
    text: TypeProps;
  };
  layout?: {
    header?: {
      container?: TypeProps;
      title?: TypeProps;
      icon?: TypeProps;
      back?: TypeProps;
    };
    drawer?: TypeProps;
    footer?: TypeProps;
    active?: TypeProps;
    main?: TypeProps;
    content?: TypeProps;
  };
  modal?: ModalType;
  buttons?: ButtonsType;
  TabsButtons?: {
    container: TypeProps;
    scroll: TypeProps;
    button: TypeProps;
    selectedButton: TypeProps;
    selectedText: TypeProps;
    text: TypeProps;
  };
  list?: {
    listItem: {
      title: TypeProps;
      subtitle: TypeProps;
      subtitle2?: TypeProps;
      date?: TypeProps;
      container?: TypeProps;
      linesContainer?: TypeProps;
      left?: TypeProps;
      right?: TypeProps;
      children?: TypeProps;
    };
  };
  avatar?: TypeProps;
  dropDownBottom?: TypeProps;
}

export const themeReducer = (
  state: ThemeState,
  action: ThemeAction,
): ThemeState => {
  switch (action.type) {
    case "set_light_theme":
      return {...themes.lightTheme};
    case "set_dark_theme":
      return {...themes.darkTheme};
    case "set_custom_theme":
      return {...themes.customTheme};
    default:
      return state;
  }
};
