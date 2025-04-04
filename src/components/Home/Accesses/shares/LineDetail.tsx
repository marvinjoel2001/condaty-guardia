import React from 'react';
import {Text, View} from 'react-native';
import {cssVar} from '../../../../../mk/styles/themes';

type LineDetailProps = {
  label: any;
  value: any;
};
const LineDetail = ({label, value}: LineDetailProps) => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: cssVar.sS,
        justifyContent: 'center',
      }}>
      <Text
        style={{
          width: '50%',
          color: cssVar.cWhiteV2,
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
