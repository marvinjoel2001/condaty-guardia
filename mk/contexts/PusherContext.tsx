import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {Pusher, PusherEvent} from '@pusher/pusher-websocket-react-native';
import configApp from '../../src/config/config';
import useAuth from '../hooks/useAuth';
import {AppState} from 'react-native';
import {processSocket} from '../../src/config/InitProject';

export interface PusherContextType {
  pusher: any;
  connect: Function;
  socketConnected: string;
  socketNew: number;
  socketEvent: any;
  notif: number;
  setNotif: Function;
  newSocketEvent: {nSocket: number; socketEvent: any};
}
export const PusherContext = createContext({} as PusherContextType);

const PusherContextProvider = ({children}: any) => {
  const [pusher, setPusher]: any = useState(null);
  const {user, logout, showToast, setStore} = useAuth();
  const [socketConnected, setSocketConnected] = useState('');
  const [socketNew, setSocketNew] = useState(0);
  const [socketEvent, setSocketEvent]: any = useState(null);
  const [notif, setNotif] = useState(0);
  const [newSocketEvent, setNewSocketEvent]: any = useState({
    nSocket: 0,
    socketEvent: null,
  });

  const init = async () => {
    try {
      let newPusher = Pusher.getInstance();
      setPusher(newPusher);
    } catch (error) {
      console.log('error Pusher', error);
    }
  };

  const unSuscribe = async () => {
    console.log('unSubscribe pusher', JSON.stringify(user.id));
    if (!pusher) return;
    // if (!user?.client_id) return;
    try {
      await pusher.unsubscribeAll();
      // pusher.unsubscribe({
      //   channelName:
      //     (
      //       configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX +
      //       '-' +
      //       configApp.APP_AUTH_IAM
      //     ).replace('/', '') + user.id,
      // });
      // pusher.unsubscribe({
      //   channelName:
      //     (
      //       configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX +
      //       '-' +
      //       configApp.APP_AUTH_IAM
      //     ).replace('/', '') +
      //     user.name +
      //     user.last_name,
      // });
      // let channelList = configApp.APP_PUSHER_BEAMS_INTERESTS.split(',');
      // channelList.push('dpto_id_' + user?.datos?.dpto_id);
      // channelList.push('mun_id_' + user?.datos?.mun_id);
      // channelList.push('barrio_id_' + user?.datos?.barrio_id);

      // channelList.forEach(async (e: any) => {
      //   await pusher.unsubscribe({
      //     channelName:
      //       configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX.replace('/', '') +
      //       user.client_id +
      //       '-' +
      //       e,
      //   });
      // });
    } catch (error) {
      console.log('error unsubscribe', error);
    }
  };
  useEffect(() => {
    init();
    return () => {
      console.log('useEffect return pusher [[[[[]]]]]');
      unSuscribe();
    };
  }, []);

  useEffect(() => {
    let appState = AppState.currentState;

    const handleAppStateChange = (nextAppState: any) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App activada. Verificando conexión...');

        if (pusher?.connectionState !== 'CONNECTED') {
          console.log('Reconectando... ' + pusher?.connectionState);
          connect();
        }
      }
      appState = nextAppState;
    };

    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // AppState.removeEventListener("change", handleAppStateChange);
    };
  }, []);

  let conectando = false;
  const propagateEvent = (event: PusherEvent) => {
    console.log(`propagateEvent before: `, event);
    setSocketEvent(event);
    setNotif((old: any) => old + 1);
    setSocketNew((old: any) => old + 1);
    setNewSocketEvent((old: any) => ({
      nSocket: old.nSocket + 1,
      socketEvent: event,
    }));
    processSocket(event, showToast, setStore);
    // console.log(`propagateEvent: ${event}`);
  };
  const connect = async () => {
    if (!pusher) init();
    if (conectando) {
      console.log('pusher esta conectando....');
      return;
    }
    conectando = true;
    if (pusher?.connectionState != 'DISCONNECTED') {
      console.log('pusher Ya Conectado');
      return;
    }
    if (pusher?.connectionState != 'CONNECTED') {
      try {
        console.log('pusher Conectando....');

        await pusher?.init({
          apiKey: configApp.APP_PUSHER_KEY,
          cluster: configApp.APP_PUSHER_CLUSTER,
          onSubscriptionSucceeded: (event: any) => {
            console.log(`onSubscriptionSucceeded:`, event);
          },
          onEvent: (event: PusherEvent) => {
            if (event.data && typeof event.data == 'string') {
              event.data = JSON.parse(event.data);
            }
            if (event.eventName == 'sessionDel') {
              const tokenActual = user?.token.split('|')[0];
              if (event.data?.id == tokenActual || event.data?.id == 0) {
                logout();
              }
              return;
            }
            if (event.eventName == 'ping') {
              event.data = {
                act: 'ping',
                msg: event.data?.msg || 'Tu conexion esta activa',
              };
              console.log('Socket Ping', event.data.msg);
            }
            propagateEvent(event);
          },
          onError: (message: string, code: number, e: any) => {
            console.log(`onError: ${message} code: ${code} exception: ${e}`);
            setSocketConnected('ERROR');
          },
          onConnectionStateChange: (currentState: any, prevState: any) => {
            console.log(
              `onConnectionStateChange: ${currentState} from ${prevState}`,
            );
            setSocketConnected(currentState);
          },
        });

        await pusher?.connect();
      } catch (e) {
        console.log('ERROR: ' + e);
      }
    }
    conectando = false;
  };

  const [suscChannels, setSuscChannels] = useState({
    id: null,
    lista_id: null,
    dpto_id: null,
    mun_id: null,
    barrio_id: null,
  });
  let iniciando = false;
  const initPush = async () => {
    if (iniciando) {
      console.log('initPush ya iniciando....');
      return;
    }
    iniciando = true;
    try {
      await pusher.subscribe({
        channelName:
          (
            configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX +
            '-' +
            configApp.APP_AUTH_IAM
          ).replace('/', '') + user?.id,
      });
      setSuscChannels({
        id: user?.id,
        lista_id: user?.datos?.lista_id,
        dpto_id: user?.datos?.dpto_id,
        mun_id: user?.datos?.mun_id,
        barrio_id: user?.datos?.barrio_id,
      });
      let channelList = configApp.APP_PUSHER_BEAMS_INTERESTS.split(',');

      channelList.push('lista_id_' + user?.datos?.lista_id);
      channelList.push('dpto_id_' + user?.datos?.dpto_id);
      channelList.push('mun_id_' + user?.datos?.mun_id);
      channelList.push('barrio_id_' + user?.datos?.barrio_id);
      channelList.forEach(async (e: any) => {
        const r = await pusher.subscribe({
          channelName:
            configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX.replace('/', '') +
            user.client_id +
            '-' +
            e,
        });
      });
    } catch (error) {
      console.log('error initPush', error);
    }

    iniciando = false;
  };

  const pconinit = () => {
    if (!pusher) init();
    if (pusher?.connectionState == 'DISCONNECTED') {
      connect();
    }
    if (pusher?.connectionState == 'CONNECTED') {
      initPush();
    }
  };

  useEffect(() => {
    // console.log('useEffect pusher', pusher?.connectionState);
    pconinit();
  }, [pusher, pusher?.connectionState]);

  useEffect(() => {
    if (!user) {
      console.log('unsuscribe useEffect user', user);
      unSuscribe();
    } else {
      if (
        suscChannels.id != user?.id ||
        suscChannels.lista_id != user?.datos?.lista_id ||
        suscChannels.dpto_id != user?.datos?.dpto_id ||
        suscChannels.mun_id != user?.datos?.mun_id ||
        suscChannels.barrio_id != user?.datos?.barrio_id
      ) {
        pconinit();
      }
    }
  }, [user]);

  const value = useMemo(() => {
    return {
      pusher,
      connect,
      socketConnected,
      socketNew,
      socketEvent,
      notif,
      setNotif,
      newSocketEvent,
    };
  }, [
    pusher,
    connect,
    socketConnected,
    socketNew,
    socketEvent,
    notif,
    setNotif,
    newSocketEvent,
  ]);

  return (
    <PusherContext.Provider value={value}>{children}</PusherContext.Provider>
  );
};

export default PusherContextProvider;

export const usePusher = () => {
  const data: PusherContextType = useContext(PusherContext);
  return {...data};
};
