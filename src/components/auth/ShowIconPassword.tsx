import Icon from '../../../mk/components/ui/Icon/Icon';
import {IconEye, IconEyeOff} from '../../icons/IconLibrary';
import Input from '../../../mk/components/forms/Input/Input';
import {cssVar} from '../../../mk/styles/themes';
import {View} from 'react-native';
import {useState} from 'react';
interface PropsType {
  errors: any;
  formState: any;
  handleInputChange: any;
}

export const InputPassworAndRepeat = ({
  errors,
  formState,
  handleInputChange,
}: PropsType) => {
  const [showPassword, setShowPassword] = useState(true);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <View>
      <Input
        label="Nueva contraseña"
        name="newPassword"
        required
        password={showPassword}
        error={errors}
        value={formState?.newPassword}
        onChange={(value: any) => handleInputChange('newPassword', value)}
        iconRight={
          showPassword ? (
            <Icon
              onPress={() => togglePasswordVisibility()}
              name={IconEyeOff}
              fillStroke={cssVar.cWhiteV2}
              color={'transparent'}
            />
          ) : (
            <Icon
              onPress={() => togglePasswordVisibility()}
              name={IconEye}
              color={cssVar.cWhiteV2}
            />
          )
        }
      />
      <Input
        label="Repetir nuevo contraseña"
        name="repPassword"
        required
        password={showPassword}
        error={errors}
        value={formState?.repPassword}
        onChange={(value: any) => handleInputChange('repPassword', value)}
        iconRight={
          showPassword ? (
            <Icon
              onPress={() => togglePasswordVisibility()}
              name={IconEyeOff}
              fillStroke={cssVar.cBlackV2}
              color={'transparent'}
            />
          ) : (
            <Icon
              onPress={() => togglePasswordVisibility()}
              name={IconEye}
              color={cssVar.cBlackV2}
            />
          )
        }
      />
    </View>
  );
};
