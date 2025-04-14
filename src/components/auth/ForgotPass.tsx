import {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import Input from '../../../mk/components/forms/Input/Input';
import useAuth from '../../../mk/hooks/useAuth';
import useApi from '../../../mk/hooks/useApi';
import {cssVar} from '../../../mk/styles/themes';
import InputCode from '../../../mk/components/forms/InputCode/InputCode';
import {checkCI, checkPasswords} from '../../../mk/utils/validations';
import {InputPassworAndRepeat} from './ShowIconPassword';
import ModalFull from '../../../mk/components/ui/ModalFull/ModalFull';
import Title from '../../../mk/components/ui/Title';
import SubTitle from '../../../mk/components/ui/SubTitle';
import Modal from '../../../mk/components/ui/Modal/Modal';
import React from 'react';
import {checkRules, hasErrors} from '../../../mk/utils/validate/Rules';

const ForgotPass = ({open, onClose, mod}: any) => {
  const [formState, setFormState]: any = useState({});
  const [errors, setErrors]: any = useState({});
  const [buttonState, setButtonState] = useState(false);
  const [isCodeFilled, setIsCodeFilled] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const {execute} = useApi();
  const {showToast} = useAuth();
  const [minutos, setMinutos] = useState(0);
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    setErrors({});
    setFormState({newPassword: null, pinned: 0});
    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [open]);

  let intervalo: any = null;

  const cuentaRegresiva = (tiempoTotal: number) => {
    const fechaInicio = new Date().getTime();
    const fechaObjetivo = fechaInicio + tiempoTotal;

    intervalo = setInterval(function () {
      const fechaActual = new Date().getTime();
      const diferencia = fechaObjetivo - fechaActual;

      const minutost = Math.floor(diferencia / (1000 * 60));
      const segundost = Math.floor((diferencia % (1000 * 60)) / 1000);

      setMinutos(minutost);
      setSegundos(segundost);

      if (diferencia < 0) {
        clearInterval(intervalo);
        setMinutos(0);
        setSegundos(0);
      }
    }, 1000);
    return intervalo;
  };

  const validationCi = () => {
    let errors: any = {};

    errors = checkRules({
      value: formState.ci,
      rules: ['required', 'ci'],
      key: 'ci',
      errors,
    });

    setErrors(errors);
    return errors;
  };

  const onGetCode = async () => {
    if (minutos || segundos > 0) {
      showToast('Espere 2 minutos para volver a solicitar el código.', 'info');
      return;
    }
    if (hasErrors(validationCi())) {
      return;
    }

    const {data, error} = await execute(
      '/' + mod + '-getpinreset',
      'POST',
      {
        ci: formState.ci,
      },
      false,
      3,
    );

    if (data?.success === true) {
      showToast(data?.message, 'success', 10000);

      setFormState({...formState, newPassword: '', pinned: 1});
      console.log('data', data);
      setButtonState(true);
      cuentaRegresiva(2 * 60 * 1000);
    } else {
      showToast(error?.message, 'error');
    }
  };

  const validate = () => {
    let errors: any = {};
    errors = checkRules({
      value: formState.code,
      rules: ['required', 'min:4'],
      key: 'code',
      errors,
    });
    errors = checkRules({
      value: formState.newPassword,
      rules: ['required'],
      key: 'newPassword',
      errors,
    });
    errors = checkRules({
      value: formState.newPassword,
      rules: ['password'],
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
    setErrors(errors);
    return errors;
  };

  const onChangePass = async () => {
    if (hasErrors(validate())) {
      return;
    }
    let url = '/' + mod + '-setpassreset';

    let param: any = {code: formState.code};

    param = {...param, password: formState.newPassword, ci: formState.ci};
    const {data, error} = await execute(url, 'POST', param, false, 3);
    console.log(error);
    if (data?.success == true) {
      showToast(data.message, 'success');
      setFormState({pinned: 0});
      setErrors({});
      onClose(false);
    } else {
      // showToast('Codigo de verificación no válido', 'error');
      if (data?.errors?.token) {
        setErrors({...errors, newPassword: data?.errors?.token});
      } else {
        setErrors({...errors, newPassword: 'Ocurrió un error'});
      }
    }
  };

  // const OnCheckCI = async (ci: string) => {
  //   const {data} = await execute(
  //     'aff-exist',
  //     'GET',
  //     {
  //       searchBy: ci,
  //       _exist: 1,
  //     },
  //     false,
  //     3,
  //   );
  //   if (data?.data == null) {
  //     if (checkCI(ci)) {
  //       setErrors({...errors, ci: checkCI(ci)});
  //     } else {
  //       setErrors({...errors, ci: ''});
  //       showToast('Cédula no registrada', 'error');
  //       setFormState({...formState, ci: ''});
  //     }
  //   } else {
  //     setErrors({...errors, ci: ''});
  //   }
  // };

  // const validatePasswords = (formState: any) => {
  //   let errors = {};
  //   const passwordError = checkPasswords(formState.newPassword);
  //   if (passwordError) errors = {...errors, newPassword: passwordError};

  //   if (formState.newPassword !== formState.repPassword)
  //     errors = {...errors, repPassword: 'La contraseña no coincide'};

  //   setErrors(errors);
  // };

  // const buttonDisabled = () => {
  //   if (formState.pinned != 1) {
  //     return !!errors.ci || !formState.ci;
  //   } else if (buttonState) {
  //     return !isCodeFilled;
  //   } else {
  //     return (
  //       !!errors.newPassword ||
  //       !!errors.repPassword ||
  //       !formState.newPassword ||
  //       !formState.repPassword
  //     );
  //   }
  // };

  const onSave = () => {
    if (formState.pinned != 1) {
      onGetCode();
    } else {
      onChangePass();
    }
  };

  // console.log('pin', pin);
  // console.log('errors-code', errors.code);

  return (
    <Modal
      open={open}
      onClose={(e: string) => onClose(e)}
      title={
        formState.pinned != 1
          ? '¿Olvidaste tu contraseña?'
          : 'Introduce el código de 4 dígitos'
      }
      buttonText={formState.pinned != 1 ? 'Obtener código' : 'Guardar cambios'}
      // disabled={buttonDisabled()}
      buttonCancel=""
      onSave={onSave}
      style={{padding: 20}}>
      {formState?.pinned != 1 ? (
        <>
          <SubTitle style={{fontSize: cssVar.sM}}>
            Se enviará un código PIN de verificación a su correo electrónico.
            Ingresa tu carnet de identidad para continuar
          </SubTitle>
          {(minutos > 0 || segundos > 0) && (
            <Text
              style={{
                color: cssVar.cError,
                fontSize: cssVar.sXs,
                paddingBottom: cssVar.spXs,
              }}>
              (Espera {minutos > 0 ? minutos + ' minuto con ' : ''}
              {segundos} segundos para solicitar un nuevo código.)
            </Text>
          )}
          <Input
            label="Cédula de identidad"
            name="ci"
            required
            type="number"
            maxLength={11}
            keyboardType="numeric"
            value={formState['ci']}
            // onBlur={() => OnCheckCI(formState['ci'])}
            // onBlur={() => validationCi(formState['ci'])}
            error={errors}
            onChange={(value: any) => handleInputChange('ci', value)}
          />
        </>
      ) : (
        <>
          <InputCode
            label="Código de acceso"
            name="code"
            type="number"
            keyboardType="numeric"
            value={formState['code']}
            error={errors}
            onCodeFilled={isFilled => setIsCodeFilled(isFilled)}
            onChange={(value: any) => handleInputChange('code', value)}
          />

          <InputPassworAndRepeat
            errors={errors}
            formState={formState}
            handleInputChange={handleInputChange}
          />
        </>
      )}
    </Modal>
  );
};

export default ForgotPass;
