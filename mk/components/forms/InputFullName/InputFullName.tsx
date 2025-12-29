import React, { useCallback } from 'react';
import Input from '../Input/Input';
import { StyleSheet, View } from 'react-native';
import { TypeStyles } from '../../../styles/themes';

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
  // se esta dejando los comentarios por si piden volver a la version anterior donde no se permitía dejar espacios en blanco 6/10/2025
  // const removeSpaces = (text: string) => {
  //   return text.replaceAll(' ', '');
  // };
  // const onChangeName = useCallback(
  //   (value: any) => {
  //     // const cleanedValue = removeSpaces(value);
  //     handleChangeInput('name' + prefijo, value);
  //   },
  //   [handleChangeInput, prefijo],
  // );
  const _onChange = useCallback(
    (name: string, value: any) => {
      // const cleanedValue = removeSpaces(value);
      handleChangeInput(name + prefijo, value);
    },
    [handleChangeInput, prefijo],
  );

  const _onBlur = useCallback(
    (name: string) => {
      const key = name + prefijo;
      const value = formState[key];

      if (typeof value === 'string') {
        handleChangeInput(key, value.trim());
      }

      onBlur(key);
    },
    [onBlur, prefijo, formState, handleChangeInput],
  );

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
            onBlur={() => _onBlur('name')}
            required={true}
            disabled={disabled}
            value={formState['name' + prefijo]}
            onChange={value => _onChange('name', value)}
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
            onBlur={() => _onBlur('middle_name')}
            value={formState['middle_name' + prefijo]}
            onChange={value => _onChange('middle_name', value)}
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
            onBlur={() => _onBlur('last_name')}
            disabled={disabled}
            value={formState['last_name' + prefijo]}
            onChange={value => _onChange('last_name', value)}
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
            onBlur={() => _onBlur('mother_last_name')}
            disabled={disabled}
            value={formState['mother_last_name' + prefijo]}
            onChange={value => _onChange('mother_last_name', value)}
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
