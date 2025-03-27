import React from 'react';
import {View} from 'react-native';
import Input from '../../../../../mk/components/forms/Input/Input';
import InputFullName from '../../../../../mk/components/forms/InputFullName/InputFullName';

interface InputNameCiProps {
  formStateName: any;
  formStateCi: any;
  nameCi?: string;
  prefix?: string;
  errors: any;
  handleChangeInput: (name: string, value: any) => void;
  disabledCi?: boolean;
  disabledName?: boolean;
  onCheckCI?: (isTaxi?: boolean) => void;
}

const InputNameCi = ({
  formStateName,
  formStateCi,
  nameCi = 'ci',
  errors,
  handleChangeInput,
  disabledCi = false,
  disabledName = false,
  prefix,
  onCheckCI,
}: InputNameCiProps) => {
    console.log(nameCi,'nameCi')
  return (
    <View style={{gap: 16}}>
      <Input
        label="Carnet de identidad"
        type="text"
        name={nameCi}
        error={errors}
        required={true}
        disabled={disabledCi}
        readOnly={disabledCi}
        value={formStateCi}
        maxLength={10}
        onChange={(value: any) => handleChangeInput(value,nameCi)}
        onBlur={() => onCheckCI && onCheckCI()}
      />
      <InputFullName
        formState={formStateName}
        errors={errors}
        handleChangeInput={handleChangeInput}
        disabled={disabledName}
        prefijo={prefix}
      />
    </View>
  );
};

export default InputNameCi;