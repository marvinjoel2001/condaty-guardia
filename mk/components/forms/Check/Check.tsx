import React from 'react';
import {Text, TouchableOpacity, ViewStyle, TextStyle} from 'react-native';
import ControlLabel, {PropsTypeInputBase} from '../ControlLabel/ControlLabel';
import Icon from '../../ui/Icon/Icon';
import {IconCheckOff, IconCheckSquare} from '../../../../src/icons/IconLibrary';
import {ThemeType, cssVar} from '../../../styles/themes';

interface PropsType extends PropsTypeInputBase {
  optionValue?: string[]; // Array con las opciones posibles (ej: ['Y', 'N'])
  textStyle?: TextStyle;
  style?: ViewStyle;
}

const Check = ({
  optionValue = ['Y', 'N'], // Valores por defecto
  onChange = e => {}, // Función para manejar el cambio
  textStyle = {},
  style = {},
  ...props
}: PropsType) => {
  const toggleSwitch = () => {
    // Cambia la opción actual a la otra opción
    const newValue =
      props.value === optionValue[0] ? optionValue[1] : optionValue[0];
    onChange(newValue); // Llama a la función onChange con el nuevo valor
  };

  return (
    <ControlLabel {...props} label="">
      <TouchableOpacity
        style={[theme.touchable, style]}
        onPress={toggleSwitch}
        disabled={props.disabled}
        activeOpacity={1}
        // testID={props.name}
        // id={props.name}
      >
        {props.value === optionValue[0] ? (
          <Icon name={IconCheckSquare} size={28} color={cssVar.cSuccess} />
        ) : (
          <Icon
            name={IconCheckOff}
            fillStroke={cssVar.cWhiteV2}
            color="transparent"
            size={28}
          />
        )}
        <Text style={[theme.textLabel, textStyle]}>{props.label}</Text>
      </TouchableOpacity>
    </ControlLabel>
  );
};

export default Check;

const theme: ThemeType = {
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: cssVar.spS,
    gap: cssVar.spM,
    width: '100%',
  },
  textLabel: {
    color: cssVar.cWhite,
    fontSize: 16,
  },
};
