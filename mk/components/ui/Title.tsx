import {Text} from 'react-native';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../styles/themes';
import React from 'react';
interface PropsType {
  children: any;
  style?: TypeStyles;
}

const Title = ({children, style}: PropsType) => {
  return <Text style={{...theme.title, ...style}}>{String(children)}</Text>;
};
const theme: ThemeType = {
  title: {
    color: cssVar.cWhite,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
};

export default Title;
