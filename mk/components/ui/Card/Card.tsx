import React from 'react';
import {View, TouchableOpacity, GestureResponderEvent} from 'react-native';
import {cssVar, ThemeType, TypeStyles} from '../../../styles/themes';

interface PropsType {
  style?: TypeStyles;
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  clickable?: boolean; // Si es true, el card se comporta como TouchableOpacity
}

const Card: React.FC<PropsType> = ({
  style,
  children,
  onPress,
  clickable = false,
}) => {
  // Si es clickeable o se pasa una función onPress, envuelve el contenido en TouchableOpacity
  if (clickable || onPress) {
    return (
      <TouchableOpacity
        style={[theme.container, style]}
        onPress={onPress}
        activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[theme.container, style]}>{children}</View>;
};

export default Card;

const theme: ThemeType = {
  container: {
    backgroundColor: cssVar.cBlack,
    borderRadius: cssVar.bRadiusS,
    padding: cssVar.spM,
    marginVertical: cssVar.spS,
  },
};
