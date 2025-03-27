import React from 'react';
import {View} from 'react-native';
import Input from '../../../../../mk/components/forms/Input/Input';
import InputFullName from '../../../../../mk/components/forms/InputFullName/InputFullName';

interface InputNameCiProps {
  formStateName: any;
  formStateCi: any;
  errors: any;
  handleInputChange: (name: string, value: any) => void;
  disabledCi?: boolean;
  disabledName?: boolean;
}

const InputNameCi = ({
  formStateName,
  formStateCi,
  errors,
  handleInputChange,
  disabledCi = false,
  disabledName = false,
}: InputNameCiProps) => {
  return (
    <View style={{gap: 16}}>
      <Input
        label="Carnet de identidad"
        type="text"
        name="ci"
        error={errors}
        required={true}
        disabled={disabledCi}
        readOnly={disabledCi}
        value={formStateCi}
        maxLength={10}
        onChange={(value: any) => handleInputChange('ci', value)}
      />
      <InputFullName
        formState={formStateName}
        errors={errors}
        handleChangeInput={handleInputChange}
        disabled={disabledName}
      />
    </View>
  );
};

export default InputNameCi;