import React from 'react';
import {Text, View} from 'react-native';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconArrowLeft, IconArrowRight} from '../../../icons/IconLibrary';
import {cssVar} from '../../../../mk/styles/themes';
import {getDateTimeStrMes} from '../../../../mk/utils/dates';
type Props = {
  access: any;
};

const DateAccess = ({access}: Props) => {
  return (
    <View style={{marginTop: 4}}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 4,
        }}>
        <Icon size={12} name={IconArrowRight} color={cssVar.cAccent} />
        <Text
          style={{
            color: cssVar.cWhiteV2,
            fontSize: 12,
          }}>
          {getDateTimeStrMes(access?.in_at)}
        </Text>
      </View>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: 4,
        }}>
        <Icon size={12} name={IconArrowLeft} color={cssVar.cError} />

        <Text
          style={{
            color: cssVar.cWhiteV2,
            fontSize: 12,
          }}>
          {getDateTimeStrMes(access?.out_at) || 'No ha salido'}
        </Text>
      </View>
    </View>
  );
};

export default DateAccess;
