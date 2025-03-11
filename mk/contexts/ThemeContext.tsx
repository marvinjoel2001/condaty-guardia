import React, { createContext, useReducer } from "react";
import { ThemeState, themeReducer } from "./ThemeReducer";
import { themes } from "../styles/themes";

interface ThemeContextProps {
  theme: ThemeState;
  setDarkTheme: () => void;
  setLightTheme: () => void;
  setCustomTheme: () => void;
}

export const ThemeContext = createContext({} as ThemeContextProps);

export const ThemeProvider = ({ children }: any) => {
  const [theme, dispatch] = useReducer(themeReducer, themes.darkTheme);
  const setDarkTheme = () => {
    dispatch({ type: "set_dark_theme" });
  };

  const setLightTheme = () => {
    dispatch({ type: "set_light_theme" });
  };
  const setCustomTheme = () => {
    dispatch({ type: "set_custom_theme" });
  };
  return (
    <ThemeContext.Provider
      value={{ theme, setDarkTheme, setLightTheme, setCustomTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
