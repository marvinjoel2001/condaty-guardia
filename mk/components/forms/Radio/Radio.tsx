import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import ControlLabel, {PropsTypeInputBase} from '../ControlLabel/ControlLabel';
import Icon from '../../ui/Icon/Icon';
import {IconRadio, IconRadioChecked} from '../../../../src/icons/IconLibrary';
import {ThemeType, TypeStyles, cssVar} from '../../../styles/themes';

interface PropsType extends PropsTypeInputBase {
  optionLabel?: string; // Etiqueta de la opción
  isSelected?: boolean; // Indica si está seleccionado
  onChange?: (selected: boolean) => void; // Función para manejar el cambio
  textStyle?: TypeStyles;
  style?: TypeStyles;
}

const Radio = ({
  optionLabel, // Etiqueta de la opción
  isSelected = false, // Estado inicial de selección
  onChange = () => {}, // Función de cambio
  textStyle = {},
  style = {},
  ...props
}: PropsType) => {
  // Función para cambiar el estado de selección
  const toggleSelection = () => {
    onChange(!isSelected); // Llama a la función onChange con el valor contrario
  };

  return (
    <ControlLabel {...props} label="">
      <TouchableOpacity
        style={[theme.touchable, style]}
        onPress={toggleSelection}
        disabled={props.disabled}
        activeOpacity={1}
        // testID={props.name}
        // id={props.name}
      >
        {isSelected ? (
          <Icon
            name={IconRadioChecked}
            size={24}
            color={'transparent'}
            fillStroke={cssVar.cSuccess}
          />
        ) : (
          <Icon
            name={IconRadio}
            size={24}
            fillStroke={cssVar.cBlackV2}
            color={'transparent'}
          />
        )}
        <Text style={[theme.textLabel, textStyle]}>{optionLabel}</Text>
      </TouchableOpacity>
    </ControlLabel>
  );
};

export default Radio;

const theme: ThemeType = {
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: cssVar.spS,
    gap: cssVar.spM,
    // width: '100%',
  },
  textLabel: {
    color: cssVar.cWhite,
    fontSize: 16,
  },
};
