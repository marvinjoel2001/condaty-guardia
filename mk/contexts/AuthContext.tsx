import {createContext, useEffect, useRef, useState} from 'react';
import Login from '../../src/components/auth/Login';
import useApi from '../hooks/useApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast, {TIME_TOAST} from '../components/ui/Toast/Toast';
import configApp from '../../src/config/config';
import {Platform} from 'react-native';
import React from 'react';

interface AuthProviderProps {
  children: any;
  noAuth?: boolean;
}
export interface AuthContextType {
  user: any;
  error: any;
  loaded: boolean;
  login: Function;
  logout: Function;
  toast: string;
  config: any;
  userCan: Function;
  showToast: Function;
  waiting: number;
  setWaiting: Function;
  splash: boolean;
  store: any;
  storeRef: any;
  setStore: Function;
  getUser: Function;
  setUser: Function;
}
export const AuthContext = createContext({} as AuthContextType);
const AuthProvider = ({children, noAuth = false}: AuthProviderProps) => {
  const {data, error, loaded, execute, waiting, setWaiting} = useApi();
  const [user, setUser] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const storeRef = useRef<any>(null);
  const [config, setConfig]: any = useState(configApp);
  const [splash, setSplash] = useState(true);
  const [toast, setToast]: any = useState({
    msg: '',
    type: 'success',
    time: TIME_TOAST,
  });

  const _setStore = async (newStore: object) => {
    await setStore((old: any) => {
      if (typeof newStore == 'function') return {...newStore(old)};
      return {...old, ...newStore};
    });
  };
  const showToast = (
    message: string = '',
    type: 'success' | 'error' | 'warning' | 'info' = 'success',
    time: number = TIME_TOAST,
  ) => {
    setToast({msg: message, type, time});
  };
  const getConfig = async () => {
    setWaiting(1, 'getConfig');
    let currentConfig: any = configApp;
    try {
      currentConfig = await AsyncStorage.getItem(
        configApp.APP_AUTH_IAM + 'config',
      );
      currentConfig =
        currentConfig != null ? JSON.parse(currentConfig) : configApp;
    } catch (e) {
      currentConfig = configApp;
    }
    setConfig(currentConfig);
    setWaiting(-1, '-getConfig');
  };
  const getUser = async (client_id = null) => {
    setSplash(true);
    setWaiting(1, 'getUser');
    let currentUser: any = false;
    let token: any = null;
    try {
      token = await AsyncStorage.getItem(configApp.APP_AUTH_IAM + 'token');
      token = token != null ? JSON.parse(token) : null;
    } catch (e) {
      token = null;
    }
    currentUser = user || token?.user;
    const credentials: any = {};
    if (client_id) credentials.client_id = client_id;
    credentials.os = Platform.OS;
    const constants: any = Platform.constants;
    if (Platform.OS == 'android') {
      credentials.device = constants?.Model;
    }
    if (Platform.OS == 'ios') {
      credentials.device = constants?.systemName + ' ' + constants?.osVersion;
    }

    if (currentUser) {
      const {data, error}: any = await execute(
        configApp.APP_AUTH_IAM,
        'POST',
        credentials,
        false,
        0,
      );
      if (data?.success && !error) {
        currentUser = data?.data?.user;
        // console.log('iam success', data?.data?.user);
        if (currentUser) currentUser = {...currentUser, token: token?.token};
        await setUser(currentUser);
        try {
          await AsyncStorage.setItem(
            configApp.APP_AUTH_IAM + 'token',
            JSON.stringify({token: token.token, user: data?.data?.user}),
          );
        } catch (error) {
          console.log('====================================');
          console.log(
            'Error storage User',
            JSON.stringify(data, null, 5),
            JSON.stringify(error, null, 5),
          );
          console.log('====================================');
        }
      } else {
        console.log('====================================');
        console.log(
          'Error get User',
          JSON.stringify(data, null, 5),
          JSON.stringify(error, null, 5),
        );
        console.log('====================================');
        if (error?.status == 500) {
          console.log('====================================');
          console.log(
            'Error conexion server 500',
            JSON.stringify(data, null, 5),
            JSON.stringify(error, null, 5),
          );
          console.log('====================================');
        }
        try {
          await AsyncStorage.removeItem(configApp.APP_AUTH_IAM + 'token');
          setUser(false);
        } catch (error) {
          console.log('====================================');
          console.log(
            'Error remove storage User',
            JSON.stringify(error, null, 5),
          );
          console.log('====================================');
        }
      }
    }
    if (currentUser) currentUser = {...currentUser, token: token?.token};
    await setUser(currentUser);
    setWaiting(-1, '-getUser2');
    setSplash(false);
  };
  const userCan = (ability: string, action: string) => {
    if (!user) return false;
    if (!user.role?.abilities?.includes(ability)) return false;
    const a = user?.role?.abilities?.indexOf(ability);
    const b = (user?.role?.abilities + '|').indexOf('|', a);
    const permiso = (user.role.abilities.substring(a, b) + ':').split(':');
    if (!(permiso[1] + '').includes(action)) return false;
    return true;
  };
  const getToken = async () => {
    try {
      await AsyncStorage.setItem(
        configApp.APP_AUTH_IAM + 'token',
        JSON.stringify({token: data?.data?.token, user: data?.data?.user}),
      );
      setWaiting(-1, '-login');
      return {user: data?.data?.user};
    } catch (error) {
      console.log('====================================');
      console.log(
        'Error storage User login',
        JSON.stringify(data, null, 5),
        JSON.stringify(error, null, 5),
      );
      console.log('====================================');
    }
  };
  const login = async (credentials: any) => {
    setWaiting(1, 'login');
    setUser(false);
    const {data, error}: any = await execute(
      configApp.APP_AUTH_LOGIN,
      'POST',
      credentials,
      false,
      0,
    );
    if (data?.success && !error) {
      console.log(
        'User Logueado:',
        JSON.stringify({id: data.data.user.id, name: data.data.user.name}),
      );
      try {
        await AsyncStorage.setItem(
          configApp.APP_AUTH_IAM + 'token',
          JSON.stringify({token: data?.data?.token, user: data?.data?.user}),
        );
        const apiToken = await AsyncStorage.getItem(
          configApp.APP_AUTH_IAM + 'token',
        );
        // console.log('apiToken New Grabado', apiToken);
        await setUser({...data?.data?.user, token: data?.data?.token});
        setWaiting(-1, '-login');
        return {user: {...data?.data?.user, token: data?.data?.token}};
      } catch (error) {
        console.log('====================================');
        console.log('Error storage User login');
        console.log('====================================');
      }
    } else {
      setUser(false);
      console.log('====================================');
      console.log('Not Logued', data, error);
      console.log('====================================');
      setWaiting(-1, '-loginError');
      return {user: false, errors: data?.errors || data?.message || error};
    }
  };
  const logout = async () => {
    try {
      setWaiting(1, 'logout');
      const {data, error}: any = await execute(
        configApp.APP_AUTH_LOGOUT,
        'POST',
      );

      await AsyncStorage.removeItem(configApp.APP_AUTH_IAM + 'token');
      setUser(false);
      if (data?.success) {
        setWaiting(-1, '-logout');
        return;
      } else {
        console.log('====================================');
        console.log('Logout Error', data);
        console.log('====================================');
        setWaiting(-1, '-logoutError');
        return {user, errors: data?.errors || data?.message || error};
      }
    } catch (error) {
      await AsyncStorage.removeItem(configApp.APP_AUTH_IAM + 'token');
      setUser(false);
      setWaiting(-1, '-logoutError2');
      console.log('====================================');
      console.log('Error remove storage User logout');
      console.log('====================================');
    }
  };
  let ejecutado = false;
  useEffect(() => {
    if (!ejecutado && setWaiting) {
      ejecutado = true;
      getConfig();
      getUser();
    }
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        loaded,
        login,
        logout,
        config,
        userCan,
        showToast,
        toast,
        waiting,
        setWaiting: setWaiting,
        splash,
        store,
        storeRef,
        setStore: _setStore,
        getUser,
        setUser,
      }}>
      {!noAuth && !user ? <Login /> : children}
      <Toast toast={toast} showToast={setToast} />
    </AuthContext.Provider>
  );
};
export default AuthProvider;
