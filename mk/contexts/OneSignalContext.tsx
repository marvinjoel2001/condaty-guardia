import React, {useContext, useEffect, useState} from 'react';
import configApp from '../../src/config/config';
import useAuth from '../hooks/useAuth';
import {createContext} from 'react';
import {Platform} from 'react-native';
import {LogLevel, OneSignal} from 'react-native-onesignal';
import {throttle} from '../utils/utils';

export interface OneSignalContextType {
  signalPermission: boolean;
  signalGetUserPermissions: Function;
  signalGetTags: Function;
  signalSetTags: Function;
  signalVerifyState: Function;
  signalInit: Function;
  signalGetInfoSignal: Function;
  signalToken: string;
  signalId: string;
}

export const OneSignalContext = createContext({} as OneSignalContextType);

const OneSignalContextProvider = ({children}: any) => {
  const {user} = useAuth();
  const [signalPermission, setSignalPermission] = useState(false);
  const [signalToken, setSignalToken] = useState('');
  const [signalId, setSignalId] = useState('');

  const _verifyState = async () => {
    // const granted = await OneSignal.Notifications.canRequestPermission();
    let permission: any = false;
    if (Platform.OS === 'ios') {
      permission = await OneSignal.Notifications.permissionNative();
      permission = permission > 1;
    } else {
      permission = await OneSignal.Notifications.getPermissionAsync();
    }
    await setSignalPermission(permission);

    return permission;
  };

  const signalVerifyState = throttle(_verifyState, 1000);
  const signalInit = async () => {
    await OneSignal.initialize(configApp.APP_SIGNAL_KEY);
    const permission = await signalVerifyState();
    console.log('One signal initiate:', permission);
  };

  const throttleInit = throttle(signalInit, 5000);

  const signalGetInfoSignal = async (msg: string = '', extra: any = null) => {
    const permission = await signalVerifyState();
    let optedIn: any = await OneSignal.User.pushSubscription.getOptedInAsync();
    const id: any = await OneSignal.User.pushSubscription.getIdAsync();
    const token: any = await OneSignal.User.pushSubscription.getTokenAsync();

    if (!optedIn) {
      await OneSignal.User.pushSubscription.optIn();
      optedIn = await OneSignal.User.pushSubscription.getOptedInAsync();
    }
    setSignalToken(token);
    setSignalId(id);
    // console.log(
    //   'getInfoSignal (' + msg + '):',
    //   JSON.stringify(
    //     {
    //       token,
    //       id,
    //       optedIn,
    //       permission,
    //       signalPermission,
    //       zextra: extra,
    //     },
    //     null,
    //     5,
    //   ),
    // );
    return permission;
  };

  useEffect(() => {
    signalGetInfoSignal('usseEffect signalPermission');
  }, [signalPermission]);

  useEffect(() => {
    if (process.env.NODE_ENV == 'development') {
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      // OneSignal.Debug.setAlertLevel(LogLevel.Verbose);
    }

    throttleInit();
    // Escuchar eventos de notificaciones recibidas y abiertas
    OneSignal.Notifications.addEventListener(
      'permissionChange',
      async (granted: boolean) => {
        signalGetInfoSignal('permission changed ', granted);
      },
    );
    const changeOneSignal: any =
      OneSignal.User.pushSubscription.addEventListener(
        'change',
        async subscription => {
          signalGetInfoSignal('permission changed ', subscription);
        },
      );
    OneSignal.Notifications.addEventListener('click', event => {
      // console.log('OneSignal: notification clicked:', event);
    });
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
      event.preventDefault();
      // console.log('OneSignal: foregroundWillDisplay:', event);
      event.getNotification().display();
    });

    //in-apps
    OneSignal.InAppMessages.addEventListener('willDisplay', event => {
      // console.log('OneSignal: will display IAM: ', event);
    });

    OneSignal.InAppMessages.addEventListener('didDisplay', event => {
      // console.log('OneSignal: did display IAM: ', event);
    });

    OneSignal.InAppMessages.addEventListener('willDismiss', event => {
      // console.log('OneSignal: will dismiss IAM: ', event);
    });

    OneSignal.InAppMessages.addEventListener(
      'didDismiss',
      async (event: any) => {
        const permission = await signalVerifyState();
        // console.log('OneSignal: did dismiss IAM: ', event, permission);
      },
    );

    OneSignal.InAppMessages.addEventListener('click', event => {
      // console.log('OneSignal IAM clicked:', event);
      OneSignal.InAppMessages.removeTrigger('showPrompt');
    });

    return () => {
      OneSignal.Notifications.clearAll();
      OneSignal.User.pushSubscription.removeEventListener(
        'change',
        changeOneSignal,
      );
    };
  }, []);

  const signalGetTags = async () => {
    const tags = await OneSignal.User.getTags();
    // console.log('Tags:', tags);
  };

  const signalSetTags = async (tags: any) => {
    console.log('onesignal tags', tags);
    await OneSignal.User.addTags(tags);
  };
  const _signalGetUserPermissions = async () => {
    // await OneSignal.setConsentGiven(true);
    console.log('OneSignal: solicitando permisos');
    await OneSignal.setConsentGiven(true);
    await OneSignal.User.pushSubscription.optIn();
    await OneSignal.InAppMessages.addTrigger('showPrompt', 'true');
    //OneSignal.getInAppMessages().removeTrigger("showPrompt");
  };

  const signalGetUserPermissions = throttle(_signalGetUserPermissions, 1000);
  const logSignal = async (user: any) => {
    if (!signalPermission) {
      signalGetUserPermissions();
      return;
    }

    if (user && user.id) {
      const userSignal =
        (
          configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX +
          '-' +
          configApp.APP_AUTH_IAM
        ).replace('/', '') + user.id;
      await OneSignal.login(userSignal);
      let interests: any = {
        client_id:
          configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX + user?.client_id || '',
        user_id: userSignal,
        lista_id:
          configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX +
            user?.datos?.lista_id +
            '' || '',
        dpto_id:
          configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX +
            user?.datos?.dpto_id +
            '' || '',
        mun_id:
          configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX +
            user?.datos?.mun_id +
            '' || '',
        barrio_id:
          configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX +
            user?.datos?.barrio_id +
            '' || '',
        client_type: 'aff',
      };
      console.log('Interest ', interests);
      await OneSignal.User.addTags(interests);
      // // console.log("OneSignal: loged in", user.id, user.client_id);
      await signalGetInfoSignal('login', interests);
    } else {
      let interests: any = {
        client_id: '',
        user_id: '',
        lista_id: '',
        dpto_id: '',
        mun_id: '',
        barrio_id: '',
        client_type: '',
      };
      await OneSignal.User.addTags(interests);
      console.log('onesignal logout tag', interests);
      await signalGetInfoSignal('logout', interests);

      OneSignal.logout();
    }
  };
  useEffect(() => {
    logSignal(user);
  }, [user, signalPermission]);

  return (
    <OneSignalContext.Provider
      value={{
        signalPermission,
        signalGetUserPermissions,
        signalGetTags,
        signalSetTags,
        signalVerifyState,
        signalInit,
        signalGetInfoSignal,
        signalToken,
        signalId,
      }}>
      {children}
    </OneSignalContext.Provider>
  );
};

export default OneSignalContextProvider;

export const useOneSignal = () => {
  const data: OneSignalContextType = useContext(OneSignalContext);
  return {...data};
};
