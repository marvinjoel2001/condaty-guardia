import {Text, TouchableOpacity} from 'react-native';
import {IconSimpleAdd} from '../../../../src/icons/IconLibrary';
import Icon from '../Icon/Icon';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../../styles/themes';
import React from 'react';

type PropsType = {
  onPress: any;
  icon?: string | React.ReactNode; // Puede ser un nombre de icono o un componente personalizado
  text?: string;
  style?: TypeStyles;
  viewBox?: string;
  size?: number;
};

const IconFloat = ({
  icon = IconSimpleAdd,
  text = '',
  onPress,
  style = {},
  viewBox = '0 0 24 24',
  size = 24,
}: PropsType) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel="Adicionar"
      style={{
        ...theme.touchable,
        ...style,
      }}>
      {typeof icon === 'string' ? (
        <Icon
          style={{alignSelf: 'center', margin: 2}}
          name={icon}
          color={cssVar.cWhite}
          viewBox={viewBox}
          size={size}
        />
      ) : (
        icon
      )}
      {text && (
        <Text
          style={{
            color: cssVar.cWhite,
            paddingHorizontal: cssVar.spXs,
            fontFamily: FONTS.semiBold,
          }}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default IconFloat;

const theme: ThemeType = {
  touchable: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    backgroundColor: cssVar.cAccent,
    padding: cssVar.spXs,
    borderRadius: cssVar.bRadiusS,
    alignSelf: 'center',
    zIndex: 100,
  },
};
