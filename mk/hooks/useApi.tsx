import {useContext, useEffect, useMemo, useRef, useState} from 'react';
import {AxiosContext} from '../contexts/AxiosContext';
import axios from 'axios';
import configApp from '../../src/config/config';
import {useNavigation} from '@react-navigation/native';

type apiResponse = {
  countInstances: number;
  cancel: Function;
  data: any;
  error: any;
  loaded: boolean;
  execute: Function;
  reload: Function;
  waiting: number;
  setWaiting: any;
};

type methodType = 'GET' | 'POST' | 'PUT' | 'DELETE';

const useApi = (
  url: string | null = null,
  method: methodType = 'GET',
  payload: any = {},
  debug: number = 0,
  ready: boolean = true,
): apiResponse => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>('');
  const [loaded, setLoaded] = useState<boolean>(false);
  const [countInstances, setCountInstances] = useState<number>(0);
  const {axiosInstance, waiting, setWaiting}: any = useContext(AxiosContext);
  const navigator: any = useNavigation();

  const instance = useMemo(() => {
    return axiosInstance || axios.create({baseURL: configApp.API_URL});
  }, [axiosInstance]);

  const controllerRef = useRef(new AbortController());

  const cancel = () => {
    controllerRef.current.abort();
    controllerRef.current = new AbortController(); // Reset the controller after aborting
  };

  const reload = async (
    props: {
      payload?: any;
      prevent?: boolean;
      debug?: number;
    } = {},
  ) => {
    if (props.prevent && countInstances === 0) return;
    const result = await execute(
      url,
      method,
      props.payload || payload,
      true,
      props.debug || 0,
    );
    return result;
  };

  const execute = async (
    _url: string | null = url,
    _method: methodType = method,
    payload: any = {},
    actualizar: boolean = false,
    debug: number = 0,
  ) => {
    setWaiting(1, 'execute:' + _url);
    setError('');
    setLoaded(false);

    if (_method === 'GET' && payload) {
      const query = new URLSearchParams(payload).toString();
      _url = _url ? `${_url}?${query}` : null;
    }

    let responseData = null;
    let responseError: {message: string; status: number; data: any} | null =
      null;

    if (configApp.APP_DEBUG > 0 || debug > 0) {
      console.log(
        '(AXIOS DEBUG)',
        JSON.stringify(
          {
            url: _url,
            payload,
            method: _method,
            urlBase: configApp.API_URL,
          },
          null,
          2,
        ),
      );
    }

    try {
      const response = await instance.request({
        signal: controllerRef.current.signal,
        data: _method === 'GET' ? undefined : payload,
        method: _method,
        url: _url,
      });

      if (configApp.APP_DEBUG > 1 || debug > 1) {
        console.log(
          '(AXIOS DEBUG RESPONSE)',
          JSON.stringify(
            configApp.APP_DEBUG === 2 || debug === 2
              ? response.data
              : {
                  ...response.data,
                  url: _url,
                  payload,
                  method: _method,
                  urlBase: response.config.baseURL,
                },
            null,
            2,
          ),
        );
      }

      if (actualizar) {
        setData(response.data);
      }
      responseData = response.data;
    } catch (err: any) {
      responseError = {
        message: err.message,
        data: err.response?.data || {},
        status: err.response?.status || 0,
      };

      console.log(
        '(ERROR AXIOS)',
        err,
        JSON.stringify(
          {
            error: responseError,
            url: _url,
            payload,
            method: _method,
            urlBase: configApp.API_URL,
          },
          null,
          2,
        ),
      );

      setError(responseError);
      if (responseError.status === 401) {
        navigator.navigate('Login');
      }
    } finally {
      setWaiting(-1, '-execute:' + _url);
      setLoaded(true);
    }

    return {data: responseData, error: responseError, loaded};
  };

  useEffect(() => {
    if (url && ready) {
      setCountInstances(countInstances + 1);
      execute(url, method, payload, true, debug);
    } else {
      setError('');
      setData([]);
      setLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    countInstances,
    cancel,
    data,
    error,
    loaded,
    execute,
    reload,
    waiting,
    setWaiting,
  };
};

export default useApi;
