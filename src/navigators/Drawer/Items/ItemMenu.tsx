import {Text, TouchableOpacity, View} from 'react-native';
import {cssVar, ThemeType} from '../../../../mk/styles/themes';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {useNavigation} from '@react-navigation/native';
import React from 'react';

import {ItemMenuProps } from '../../../types/menu-item-types';

export const ItemMenu = ({
  screen = null,
  text,
  onPress = null,
  icon = '',
  activeItem = '',
  reverse = false,
  colorText,
  color,
}: ItemMenuProps) => {
  const navigation: any = useNavigation();
  const isActive = activeItem === screen;
  const press = () => {
    onPress ? onPress() : navigation.navigate(screen);
  };
  return (
    <TouchableOpacity
      style={[theme.containerBox,
        // isActive && {
        //   backgroundColor: cssVar.cPrimary,
        // },
      ]}
      onPress={() => press()}>
      <View
        style={{...theme.containerItem,
          backgroundColor: isActive ? cssVar.cBlackV1 : cssVar.cBlack,
        }}>
        {icon != '' && (
          <Icon
            name={icon}
            color={
              !reverse
                ? 'transparent'
                : isActive
                ? cssVar.cWhite
                : color
                ? color
                : cssVar.cWhiteV1
            }
            fillStroke={
              reverse
                ? 'transparent'
                : isActive
                ? cssVar.cWhite
                : color
                ? color
                : cssVar.cWhiteV1
            }
          />
        )}
        <Text
          style={{
            color: colorText
              ? colorText
              : isActive
              ? cssVar.cWhite
              : cssVar.cWhiteV1,
          }}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ItemMenu;

const theme: ThemeType = {
  containerBox: {
    paddingVertical: 12,
    marginHorizontal: 8
  },
  containerItem: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 10,
    alignItems: 'center'
  }
};