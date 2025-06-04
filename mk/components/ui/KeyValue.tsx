import React from 'react';
import {Text, View} from 'react-native';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../styles/themes';

interface PropsType {
  keys: string;
  value: string | React.ReactNode;
  colorValue?: string;
  style?: TypeStyles;
}

const KeyValue = ({keys, value, colorValue, style}: PropsType) => {
  return (
    <View style={{...theme.container, ...style}}>
      <Text style={theme.key}>{keys}</Text>
      {typeof value === 'string' ? (
        <Text style={{...theme.value, color: colorValue || cssVar.cWhite}}>
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  );
};
const theme: ThemeType = {
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  key: {
    flex: 1,
    color: cssVar.cWhiteV1,
    // textAlign: 'right',
    fontFamily: FONTS.regular,
    fontSize: cssVar.sM,
  },
  value: {
    flex: 1,
    textAlign: 'right',
    // color: cssVar.cWhite,
    fontFamily: FONTS.medium,
    fontSize: cssVar.sM,
  },
};

export default KeyValue;
