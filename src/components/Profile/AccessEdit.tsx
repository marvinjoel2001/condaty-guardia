import React, {useCallback, useState} from 'react';
import Modal from '../../../mk/components/ui/Modal/Modal';
import {Text, View} from 'react-native';
import InputCode from '../../../mk/components/forms/InputCode/InputCode';
import Input from '../../../mk/components/forms/Input/Input';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {IconEye, IconEyeOff} from '../../icons/IconLibrary';
import useApi from '../../../mk/hooks/useApi';
import useAuth from '../../../mk/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import configApp from '../../config/config';
import {checkRules, hasErrors} from '../../../mk/utils/validate/Rules';
type PropsType = {
  open: boolean;
  onClose: any;
  type: any;
};

const AccessEdit = ({open, onClose, type}: PropsType) => {
  const [formState, setFormState]: any = useState({
    pinned: 1,
  });
  const [showPassword, setShowPassword] = useState(true);
  const {execute} = useApi();
  const [errors, setErrors] = useState({});
  const {showToast, setUser, user, getUser} = useAuth();
  const handleInputChange = (name: string, value: string) => {
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const onGetCode = async () => {
    const {data, error} = await execute('/owner-getpin', 'POST', {}, false, 3);
    if (data?.success == true) {
      showToast(data.message, 'success');
      setFormState({...formState, pinned: 1, code: ''});
    } else {
      showToast(error?.message, 'error');
    }
  };

  const validate = (field = '') => {
    let errors: any = {};

    errors = checkRules({
      value: formState.code,
      rules: ['required', 'min:4'],
      key: 'code',
      errors,
    });

    if (type == 'M') {
      errors = checkRules({
        value: formState.newEmail,
        rules: ['required', 'email'],
        key: 'newEmail',
        errors,
      });
    }
    if (type == 'P') {
      errors = checkRules({
        value: formState.newPassword,
        rules: ['required', 'password'],
        key: 'newPassword',
        errors,
      });
      errors = checkRules({
        value: formState.repPassword,
        rules: ['required', 'same:newPassword'],
        key: 'repPassword',
        errors,
        data: formState,
      });
    }

    setErrors(errors);
    return errors;
  };

  const onChangeData = async () => {
    if (hasErrors(validate())) {
      return;
    }
    let url = '/guard-setemail';
    let param: any = {code: formState.code};
    if (type == 'M') {
      param = {...param, email: formState.newEmail};
    } else {
      url = '/guard-setpass';
      param = {...param, password: formState.newPassword};
    }
    const {data, error} = await execute(url, 'POST', param, false, 3);
    console.log(data);
    if (data?.success == true) {
      if (type == 'M') {
        setUser({...user, email: formState?.newEmail});
        await AsyncStorage.setItem(
          configApp.APP_AUTH_IAM + 'token',
          JSON.stringify({
            token: user.token,
            user: {...user, email: formState.newEmail},
          }),
        );
      }
      onClose();
      showToast(data.message, 'success');
      setFormState({pinned: 0});
      setErrors({});
      getUser();
    } else {
      // showToast(error?.data?.message || error?.message, 'error');
      if (data?.message) {
        setErrors({newPassword: data?.message});
      } else {
        setErrors({newPassword: 'Ocurrió un error'});
      }
    }
  };

  const onCheckEmail = useCallback(async () => {
    setErrors({});
    let errors: any = [];
    errors = checkRules({
      value: formState.newEmail,
      rules: ['required', 'email'],
      key: 'newEmail',
      errors,
    });
    if (hasErrors(errors)) {
      setFormState({...formState, enableButton: false});
      setErrors(errors);
      return;
    }
    const {data} = await execute(
      '/guards',
      'GET',
      {
        fullType: 'EXIST',
        type: 'email',
        searchBy: formState.newEmail,
      },
      false,
      3,
    );

    if (data?.success && data.data?.data?.id) {
      showToast('El email ya esta en uso', 'warning');
      setFormState({...formState, newEmail: '', enableButton: false});
      setErrors({newEmail: 'El correo ya se encuentra registrado'});
      // return;
    } else {
      setFormState({...formState, enableButton: true});
    }
  }, [formState]);
  // const onCheckEmail = async () => {
  //   let email = formState.newEmail;
  //   setErrors({});
  //   const result = await onExist({
  //     execute,
  //     field: 'email',
  //     value: email,
  //     module: 'ownerexist',
  //     cols: 'id,name,middle_name,last_name,mother_last_name,ci,email',
  //   });
  //   if (!result) {
  //     setFormState({...formState, enableButton: true});
  //   } else {
  //     if (result.email == email) {
  //       setErrors({newEmail: 'El correo ya se encuentra registrado'});
  //       return;
  //     }
  //   }
  // };

  const _onClose = () => {
    onClose();
    setFormState({pinned: 0});
    setErrors({});
  };
  return (
    <Modal
      open={open}
      title={
        (type == 'M' ? 'Cambiar correo' : 'Cambiar contraseña') +
        formState.newEmail
      }
      onClose={_onClose}
      onSave={formState.pinned != 1 ? onGetCode : onChangeData}
      buttonText={formState.pinned != 1 ? 'Enviar PIN' : 'Cambiar'}
      buttonCancel=""
      disabled={type == 'M' && formState.pinned == 1 && !formState.enableButton}
      headerStyles={{backgroundColor: 'transparent'}}>
      {formState.pinned != 1 ? (
        <View>
          <Text
            style={{
              fontSize: 14,
              fontFamily: FONTS.regular,
              color: cssVar.cWhiteV1,
            }}>
            Se enviará un código PIN de verificación a su correo
          </Text>
        </View>
      ) : (
        <>
          {/* <Input
            label="Código PIN"
            name="code"
            required
            placeholder="Código PIN"
            value={formState['code']}
            error={errors}
            onChange={(value: any) => handleInputChange('code', value)}
          /> */}
          <InputCode
            value={formState.code}
            name="code"
            required
            label="P I N"
            onChange={(value: any) => handleInputChange('code', value)}
            error={errors}
          />
          {type == 'M' ? (
            <Input
              label="Correo nuevo"
              name="newEmail"
              placeholder="Nuevo correo electrónico"
              value={formState['newEmail']}
              onBlur={() => onCheckEmail()}
              error={errors}
              required
              onChange={(value: any) => handleInputChange('newEmail', value)}
            />
          ) : (
            <>
              <Input
                label="Nueva contraseña"
                name="newPassword"
                required
                placeholder="Nueva contraseña"
                password={showPassword}
                error={errors}
                value={formState['newPassword']}
                onChange={(value: any) =>
                  handleInputChange('newPassword', value)
                }
              />

              <Input
                label="Repita la contraseña"
                name="repPassword"
                required
                placeholder="Repetir la contraseña"
                password={showPassword}
                iconRight={
                  showPassword ? (
                    <Icon
                      onPress={() => togglePasswordVisibility()}
                      name={IconEyeOff}
                      fillStroke={cssVar.cWhiteV1}
                      color={'transparent'}
                    />
                  ) : (
                    <Icon
                      onPress={() => togglePasswordVisibility()}
                      name={IconEye}
                      color={cssVar.cWhiteV1}
                    />
                  )
                }
                error={errors}
                value={formState['repPassword']}
                onChange={(value: any) =>
                  handleInputChange('repPassword', value)
                }
              />
            </>
          )}
        </>
      )}
    </Modal>
  );
};

export default AccessEdit;
