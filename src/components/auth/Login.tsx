import {useEffect, useState} from 'react';
import {
  ImageBackground,
  Linking,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '../../../mk/components/forms/Button/Button';
import {cssVar, FONTS, ThemeType} from '../../../mk/styles/themes';
import Form from '../../../mk/components/forms/Form/Form';
import configApp from '../../config/config';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {IconEye, IconEyeOff} from '../../icons/IconLibrary';
import {OneSignal} from 'react-native-onesignal';
import useAuth from '../../../mk/hooks/useAuth';
import {checkCI, checkPasswords} from '../../../mk/utils/validations';
import Input from '../../../mk/components/forms/Input/Input';
import ForgotPass from './ForgotPass';
import React from 'react';
import Splash from '../Splash/Splash';
import {checkRules, hasErrors} from '../../../mk/utils/validate/Rules';

const Login = () => {
  const [formState, setFormState]: any = useState({});
  const [onRegister, setOnRegister] = useState(false);
  const [onForgotPass, setOnForgotPass] = useState(false);
  const [errors, setErrors] = useState({});
  const {login, user, waiting, splash, setSplash} = useAuth();
  const [showPassword, setShowPassword] = useState(true);
  const [load, setLoad] = useState(true);

  const handleInputChange = (name: string, value: string) => {
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const signalInit = async () => {
    try {
      await OneSignal.initialize(configApp.APP_SIGNAL_KEY);
      OneSignal.User.addTags({client_id: '', user_id: ''});
      OneSignal.logout();
      console.log('One signal initiate login:');
    } catch (error) {
      console.log('error login Onesignal logout', error);
    }
  };

  useEffect(() => {
    console.log('logout Onesignal');
    signalInit();
  }, []);

  const validate = () => {
    let errors: any = {};
    errors = checkRules({
      value: formState.email,
      rules: ['required', 'ci'],
      key: 'email',
      errors,
    });
    errors = checkRules({
      value: formState.password,
      rules: ['required'],
      key: 'password',
      errors,
    });

    setErrors(errors);
    return errors;
  };

  const handleSubmit = async () => {
    if (hasErrors(validate())) {
      return;
    }
    login(formState)
      .then((data: any) => {
        setSplash(false);
        if (!(user || data?.user)) {
          if (data?.errors?.status == 500) {
            setErrors({
              ci: 'Problemas de conexion con el servidor... Intente más tarde.',
            });
          } else {
            setErrors(
              data?.errors == 'Acceso incorrecto'
                ? {password: 'Credenciales incorrectas'}
                : data?.errors,
            );
            console.log('entre!', data?.errors?.status);
          }
        }
        return;
      })
      .catch((err: any) => {
        setSplash(false);
        console.log('====================================');
        console.log('Error Login network', err, errors);
        console.log('====================================');
      });
  };

  const goTerminos = () => {
    Linking.openURL('https://www.condaty.com/terminos');
  };

  const goPoliticas = () => {
    Linking.openURL('https://www.condaty.com/politicas');
  };

  return (
    <SafeAreaView style={theme.safeAreaView}>
      {splash ? (
        <Splash />
      ) : (
        <Form behaviorAndroid="height" hideKeyboard={true}>
          <ImageBackground
            source={require('../../images/ImageLogin.png')}
            style={{
              flex: 1,
              marginTop: -70,
            }}
            resizeMode="cover"
          />
          <View style={theme.container}>
            <Text style={theme.titleLogin}>¡Te damos la bienvenida!</Text>
            <Text style={theme.subtitleLogin}>Guardia</Text>
            <Input
              label="Cédula de identidad"
              name="email"
              required
              type="number"
              maxLength={11}
              keyboardType="numeric"
              value={formState['email']}
              onBlur={() => {
                setErrors({...errors, email: checkCI(formState.email)});
              }}
              error={errors}
              onChange={(value: any) => handleInputChange('email', value)}
            />
            <Input
              label="Contraseña"
              name="password"
              required
              password={showPassword}
              error={errors}
              value={formState['password']}
              onBlur={() => {
                setErrors({
                  ...errors,
                  password: checkPasswords(formState.password),
                });
              }}
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
              onChange={(value: any) => handleInputChange('password', value)}
            />

            <Button
              onPress={handleSubmit}
              disabled={!formState.email || !formState.password}>
              Iniciar sesión
            </Button>
            <Text
              onPress={() => {
                setErrors('');
                setOnForgotPass(true);
              }}
              style={{
                marginTop: cssVar.spL,
                marginBottom: cssVar.spL,
                textAlign: 'center',
                color: cssVar.cWhite,
                textDecorationLine: 'underline',
              }}>
              Olvidé mi contraseña
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}>
              <Text
                style={{
                  color: cssVar.cWhite,
                  fontSize: 10,
                }}>
                Al iniciar sesión aceptas los
              </Text>
              <TouchableOpacity onPress={goTerminos} style={{height: 48}}>
                <Text
                  style={{
                    color: cssVar.cAccent,
                    fontSize: 10,
                  }}>
                  {' Términos y Condiciones '}
                </Text>
              </TouchableOpacity>

              <Text
                style={{
                  color: cssVar.cWhite,
                  fontSize: 10,
                }}>
                y nuestras
              </Text>
              <TouchableOpacity onPress={goPoliticas} style={{height: 20}}>
                <Text
                  style={{
                    color: cssVar.cAccent,
                    fontSize: 10,
                    marginBottom: 0,
                    top: -30,
                    fontFamily: 'Poppins Regular',
                  }}>
                  Políticas de Privacidad
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Form>
      )}
      <ForgotPass
        open={onForgotPass}
        onClose={() => {
          setOnForgotPass(false);
        }}
        mod="guard"
      />
    </SafeAreaView>
  );
};
const theme: ThemeType = {
  safeAreaView: {
    flex: 1,
    backgroundColor: cssVar.cBlack,
  },

  logo: {
    backgroundColor: cssVar.cBlack,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 40,
    height: 64,
    width: 200,
  },
  textLogo: {
    color: cssVar.cWhite,
    fontFamily: FONTS.bold,
    fontSize: cssVar.sXxl,
  },
  titleLogin: {
    color: cssVar.cWhite,
    fontFamily: FONTS.bold,
    fontSize: 24,
    textAlign: 'center',
  },
  subtitleLogin: {
    color: cssVar.cWhiteV1,
    textAlign: 'center',
    fontFamily: FONTS.regular,
    fontSize: 14,
    marginBottom: 24,
  },

  container: {
    paddingHorizontal: 16,
    backgroundColor: cssVar.cBlack
  },
  noAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: cssVar.spM,
  },
  noAccountText: {
    color: cssVar.cBlackV2,
    fontSize: cssVar.sS,
    fontFamily: FONTS.medium,
  },
};

export default Login;
