import React from 'react';
import {Text, View} from 'react-native';
import {cssVar, TypeStyles} from '../../../../../mk/styles/themes';

type LineDetailProps = {
  label: any;
  value: any;
  style?: TypeStyles;
};
const LineDetail = ({label, value, style}: LineDetailProps) => {
  return (
    <View
      style={{
        ...style,
        display: 'flex',
        flexDirection: 'row',
        gap: cssVar.sS,
        justifyContent: 'center',
      }}>
      <Text
        style={{
          width: '50%',
          color: cssVar.cWhiteV1,
          textAlign: 'right',
        }}>
        {label}
      </Text>
      <Text style={{width: '50%', color: cssVar.cWhite, fontWeight: 'bold'}}>
        {value}
      </Text>
    </View>
  );
};

export default LineDetail;
