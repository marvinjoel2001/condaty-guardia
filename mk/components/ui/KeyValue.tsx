import React from 'react';
import {Text, View} from 'react-native';
import {cssVar, FONTS, ThemeType} from '../../styles/themes';

interface PropsType {
  keys: string;
  value: string;
}

const KeyValue = ({keys, value}: PropsType) => {
  return (
    <View style={theme.container}>
      <Text style={theme.key}>{keys}</Text>
      <Text style={theme.value}>{value}</Text>
    </View>
  );
};
const theme: ThemeType = {
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  key: {
    flex: 1,
    color: cssVar.cBlackV2,
    // textAlign: 'right',
    fontFamily: FONTS.regular,
    fontSize: cssVar.sM,
  },
  value: {
    flex: 1,
    textAlign: 'right',
    color: cssVar.cWhite,
    fontFamily: FONTS.regular,
    fontSize: cssVar.sM,
  },
};

export default KeyValue;
