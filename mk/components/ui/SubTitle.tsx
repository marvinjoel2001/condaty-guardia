import React from 'react';
import {Text} from 'react-native';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../styles/themes';
interface PropsType {
  children: any;
  style?: TypeStyles;
}
const SubTitle = ({children, style}: PropsType) => {
  return <Text style={{...theme.subTitle, ...style}}>{children}</Text>;
};
const theme: ThemeType = {
  subTitle: {
    color: cssVar.cWhiteV2,
    fontSize: 12,
    paddingVertical: 8,
    fontFamily: FONTS.regular,
  },
};

export default SubTitle;
