import React, {useCallback} from 'react';
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
  // Función para limpiar espacios de forma inteligente (FUTURO - cuando gerencia apruebe nombres compuestos)
  // const cleanSpaces = (text: string) => {
  //   // Eliminar espacios al inicio y final, y reducir espacios múltiples a uno solo
  //   return text.trim().replaceAll(/\s+/g, ' ');
  // };

  // Función actual: elimina TODOS los espacios (por orden de gerencia)
  const removeSpaces = (text: string) => {
    return text.replaceAll(' ', '');
  };

  // Memoizar las funciones onChange para evitar recrearlas en cada render
  const onChangeName = useCallback((value: any) => {
    const cleanedValue = removeSpaces(value);
    handleChangeInput('name' + prefijo, cleanedValue);
  }, [handleChangeInput, prefijo]);

  const onChangeMiddleName = useCallback((value: any) => {
    const cleanedValue = removeSpaces(value);
    handleChangeInput('middle_name' + prefijo, cleanedValue);
  }, [handleChangeInput, prefijo]);

  const onChangeLastName = useCallback((value: any) => {
    const cleanedValue = removeSpaces(value);
    handleChangeInput('last_name' + prefijo, cleanedValue);
  }, [handleChangeInput, prefijo]);

  const onChangeMotherLastName = useCallback((value: any) => {
    const cleanedValue = removeSpaces(value);
    handleChangeInput('mother_last_name' + prefijo, cleanedValue);
  }, [handleChangeInput, prefijo]);

  // Memoizar las funciones onBlur
  const onBlurName = useCallback(() => {
    onBlur('name' + prefijo);
  }, [onBlur, prefijo]);

  const onBlurMiddleName = useCallback(() => {
    onBlur('middle_name' + prefijo);
  }, [onBlur, prefijo]);

  const onBlurLastName = useCallback(() => {
    onBlur('last_name' + prefijo);
  }, [onBlur, prefijo]);

  const onBlurMotherLastName = useCallback(() => {
    onBlur('mother_last_name' + prefijo);
  }, [onBlur, prefijo]);

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
            onBlur={onBlurName}
            required={true}
            disabled={disabled}
            value={formState['name' + prefijo]}
            onChange={onChangeName}
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
            onBlur={onBlurMiddleName}
            value={formState['middle_name' + prefijo]}
            onChange={onChangeMiddleName}
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
                onBlur={onBlurLastName}
                disabled={disabled}
                value={formState['last_name' + prefijo]}
                onChange={onChangeLastName}
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
        onBlur={onBlurMotherLastName}
        disabled={disabled}
        value={formState['mother_last_name' + prefijo]}
        onChange={onChangeMotherLastName}
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
