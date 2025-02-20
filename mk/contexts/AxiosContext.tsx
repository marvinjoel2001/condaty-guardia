import React from 'react';
import axios from 'axios';
import {createContext, useEffect, useRef, useState} from 'react';
import configApp from '../../src/config/config';
import {View} from 'react-native';

interface AxiosContextProps {
  config?: any;
  interceptors?: any | null;
  children: any;
}

type AxiosContextType = {
  axiosInstance: any;
  waiting: number;
  setWaiting: any;
};

export const AxiosContext = createContext({} as AxiosContextType);

const AxiosProvider = ({
  config = {},
  interceptors = null,
  children,
}: AxiosContextProps) => {
  const [waiting, setWaiting] = useState(0);
  const _setWaiting = (step = 1, origen = '') => {
    setWaiting(state => {
      return state + step;
    });
  };

  if (!config.baseURL) {
    config = {
      ...config,
      baseURL: configApp.API_URL,
    };
  }

  const instanceRef = useRef(axios.create(config));
  instanceRef.current.defaults.withCredentials = true;

  useEffect(() => {
    if (interceptors) {
      interceptors(instanceRef.current);
    }
  }, []);

  return (
    <AxiosContext.Provider
      value={{
        axiosInstance: instanceRef.current,
        waiting,
        setWaiting: _setWaiting,
      }}>
      {children}
      {/* <View
        style={{
          position: 'absolute',
          borderColor:
            configApp.API_URL == configApp.API_URL_DEV
              ? 'yellow'
              : configApp.API_URL == configApp.API_URL_TEST
              ? 'green'
              : 'black',
          borderRightWidth: configApp.API_URL == configApp.API_URL_PROD ? 0 : 2,
          // display: 'flex',
          width: 2,
          height: 50,
          bottom: 100,
          right: 0,
        }}></View> */}
    </AxiosContext.Provider>
  );
};

export default AxiosProvider;
