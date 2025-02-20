import {ColorValue, TouchableOpacity, View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {TypeStyles} from '../../../styles/themes';
import React from 'react';
export interface IconType {
  style?: TypeStyles;
  size?: number;
  onPress?: any;
  color?: ColorValue;
}

interface IconWrapType extends IconType {
  name: string;
  viewBox?: string;
  fillStroke?: string;
  reverse?: boolean;
  size?: number;
  accessibilityLabel?: string;
}

const Icon = ({
  style = {},
  onPress = undefined,
  color = 'currentColor',
  fillStroke = 'transparent',
  size = 24,
  viewBox = '0 0 24 24',
  name,
  accessibilityLabel = '',
}: IconWrapType) => {
  const icono = `<svg width="${size}" height="${size}" viewBox="${viewBox}">${name}</svg>`;
  const view = (
    <View style={style}>
      <SvgXml
        xml={icono}
        width={size}
        height={size}
        fill={color}
        stroke={fillStroke}
      />
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}>
        {view}
      </TouchableOpacity>
    );
  }
  return view;
};

export default Icon;
