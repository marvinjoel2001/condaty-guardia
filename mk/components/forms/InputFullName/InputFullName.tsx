import React from 'react';
import Input from '../Input/Input';
import {View} from 'react-native';
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
  onBlur = (e: any) => {},
}: PropsType) => {
  const _onChange = (name: string, value: any) => {
    value = (value + ' ').split(' ')[0];
    handleChangeInput(name, value);
  };
  return (
    <>
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

      <Input
        label="Segundo nombre (opcional)"
        type="text"
        style={styleInputs}
        error={errors}
        name={'middle_name' + (name_prefijo || prefijo)}
        required={false}
        autoCapitalize="words"
        disabled={disabled}
        onBlur={() => onBlur('middle_name' + prefijo)}
        value={formState['middle_name' + prefijo]}
        onChange={(value: any) =>
          handleChangeInput('middle_name' + prefijo, value)
        }
      />

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
        onChange={(value: any) =>
          handleChangeInput('last_name' + prefijo, value)
        }
      />

      <Input
        label="Apellido materno (opcional)"
        type="text"
        style={styleInputs}
        name={'mother_last_name' + (name_prefijo || prefijo)}
        required={false}
        error={errors}
        autoCapitalize="words"
        onBlur={() => onBlur('mother_last_name' + prefijo)}
        disabled={disabled}
        value={formState['mother_last_name' + prefijo]}
        onChange={(value: any) =>
          handleChangeInput('mother_last_name' + prefijo, value)
        }
      />
    </>
  );
};

export default InputFullName;
