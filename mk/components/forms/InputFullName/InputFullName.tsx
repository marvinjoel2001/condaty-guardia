import React from 'react';
import Input from '../Input/Input';
import {StyleSheet, View} from 'react-native';
import {TypeStyles} from '../../../styles/themes';

type PropsType = {
  formState: any;
  errors: any;
  prefijo?: string;
  name_prefijo?: string;
  handleChangeInput: any;
  disabled?: boolean;
  styleInputs?: any;
  style?: TypeStyles;
  onBlur?: any;
  inputGrid?: boolean;
};

const InputFullName = ({
  formState,
  errors,
  prefijo = '',
  name_prefijo = '',
  handleChangeInput,
  disabled = false,
  styleInputs = {},
  style = {},
  inputGrid = false,
  onBlur = (e: any) => {},
}: PropsType) => {
  const _onChange = (name: string, value: any) => {
    // Eliminar todos los espacios del valor ingresado
    value = value.replace(/\s+/g, '');
    handleChangeInput(name, value);
  };

  const container = inputGrid ? styles.container : {};
  const input1 = inputGrid ? styles.input1 : {};
  const input2 = inputGrid ? styles.input2 : {};

  return (
    <>
      <View style={container}>
        <View style={input1}>
          <Input
            label="Primer nombre"
            type="text"
            style={styleInputs}
            name={'name' + (name_prefijo || prefijo)}
            error={errors}
            autoCapitalize="words"
            onBlur={() => onBlur('name' + prefijo)}
            required={true}
            disabled={disabled}
            value={formState['name' + prefijo]}
            onChange={(value: any) => _onChange('name' + prefijo, value)}
          />
        </View>
        <View style={input2}>
          <Input
            label="Segundo nombre"
            type="text"
            style={styleInputs}
            error={errors}
            name={'middle_name' + (name_prefijo || prefijo)}
            required={false}
            autoCapitalize="words"
            disabled={disabled}
            onBlur={() => onBlur('middle_name' + prefijo)}
            value={formState['middle_name' + prefijo]}
            onChange={(value: any) => _onChange('middle_name' + prefijo, value)}
          />
        </View>
      </View>
      <View style={container}>
          <View style={input1}>
              <Input
                label="Apellido paterno"
                type="text"
                style={styleInputs}
                name={'last_name' + (name_prefijo || prefijo)}
                error={errors}
                required={true}
                autoCapitalize="words"
                onBlur={() => onBlur('last_name' + prefijo)}
                disabled={disabled}
                value={formState['last_name' + prefijo]}
                onChange={(value: any) => _onChange('last_name' + prefijo, value)}
              />
              </View>
  <View style={input2}>
      <Input
        label="Apellido materno"
        type="text"
        style={styleInputs}
        name={'mother_last_name' + (name_prefijo || prefijo)}
        required={false}
        error={errors}
        autoCapitalize="words"
        onBlur={() => onBlur('mother_last_name' + prefijo)}
        disabled={disabled}
        value={formState['mother_last_name' + prefijo]}
        onChange={(value: any) => _onChange('mother_last_name' + prefijo, value)}
      />
      </View>
      </View>
    </>
  );
};

export default InputFullName;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input1: {
    width: '49%',
  },
  input2: {
    width: '48.5%',
  },
});
