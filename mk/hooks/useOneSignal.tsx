import {useEffect, useState} from 'react';
import {OneSignal, LogLevel} from 'react-native-onesignal';
import configApp from '../../src/config/config';
import {Platform} from 'react-native';
import {throttle} from '../utils/utils';

const useOneSignal = (user: any = null) => {
  const [signalPermission, setSignalPermission] = useState(false);
  const [signaltoken, setSignalToken] = useState('');
  const [signalId, setSignalId] = useState('');

  const _verificarEstado = async () => {
    // const granted = await OneSignal.Notifications.canRequestPermission();

    let permission: any = false;
    if (Platform.OS === 'ios') {
      permission = await OneSignal.Notifications.permissionNative();
      permission = permission > 1;
    } else {
      permission = await OneSignal.Notifications.hasPermission();
    }
    setSignalPermission(permission);
    const optedIn = await OneSignal.User.pushSubscription.getOptedIn();
    const granted = await OneSignal.Notifications.canRequestPermission();
    const id = await OneSignal.User.pushSubscription.getPushSubscriptionId();
    const token =
      await OneSignal.User.pushSubscription.getPushSubscriptionToken();
    console.log('OneSignal: verificar estado:', {
      permission,
      optedIn,
      granted,
      id,
      token,
    });

    return !permission;
  };

  const verificarEstado = throttle(_verificarEstado, 1000);
  const init = async () => {
    await OneSignal.initialize(configApp.APP_SIGNAL_KEY);
    const permission = await verificarEstado();
    console.log('One signal initiate:', permission);
  };

  const throttleInit = throttle(init, 5000);

  // useEffect(() => {
  //   init();
  // }, []);

  const getInfoSignal = async (msg: string = '', extra: any = null) => {
    const token =
      await OneSignal.User.pushSubscription.getPushSubscriptionToken();
    const optedIn = await OneSignal.User.pushSubscription.getOptedIn();
    const id = await OneSignal.User.pushSubscription.getPushSubscriptionId();
    const permission = await verificarEstado();
    setSignalToken(token);
    setSignalId(id);
    console.log('getInfoSignal (' + msg + '):', {
      token,
      id,
      optedIn,
      permission,
      extra,
    });
  };
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
        getInfoSignal('permission changed ', granted);
      },
    );
    const changeOneSignal: any =
      OneSignal.User.pushSubscription.addEventListener(
        'change',
        async subscription => {
          getInfoSignal('permission changed ', subscription);
        },
      );
    OneSignal.Notifications.addEventListener('click', event => {
      console.log('OneSignal: notification clicked:', event);
    });
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
      event.preventDefault();
      console.log('OneSignal: foregroundWillDisplay:', event);
      event.getNotification().display();
    });

    //in-apps
    OneSignal.InAppMessages.addEventListener('willDisplay', event => {
      console.log('OneSignal: will display IAM: ', event);
    });

    OneSignal.InAppMessages.addEventListener('didDisplay', event => {
      console.log('OneSignal: did display IAM: ', event);
    });

    OneSignal.InAppMessages.addEventListener('willDismiss', event => {
      console.log('OneSignal: will dismiss IAM: ', event);
    });

    OneSignal.InAppMessages.addEventListener(
      'didDismiss',
      async (event: any) => {
        const permission = await verificarEstado();
        console.log('OneSignal: did dismiss IAM: ', event, permission);
      },
    );

    OneSignal.InAppMessages.addEventListener('click', event => {
      console.log('OneSignal IAM clicked:', event);
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

  const getTags = async () => {
    const tags = await OneSignal.User.getTags();
    console.log('Tags:', tags);
  };

  const setTags = async (tags: any) => {
    await OneSignal.User.addTags(tags);
  };
  const solicitarPermisos = async () => {
    // await OneSignal.setConsentGiven(true);
    console.log('OneSignal: solicitando permisos');
    await OneSignal.setConsentGiven(true);
    await OneSignal.User.pushSubscription.optIn();
    await OneSignal.InAppMessages.addTrigger('showPrompt', 'true');
    //OneSignal.getInAppMessages().removeTrigger("showPrompt");
  };

  const throttleSoliditarPermisos = throttle(solicitarPermisos, 1000);
  useEffect(() => {
    const logSignal = async (user: any) => {
      if (!signalPermission) {
        throttleSoliditarPermisos();
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
            configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX + user?.client_id,
          user_id: userSignal,
        };
        await OneSignal.User.addTags(interests);
        // console.log("OneSignal: loged in", user.id, user.client_id);
        await getInfoSignal('login', interests);
      } else {
        let interests: any = {
          client_id: '',
          user_id: '',
        };
        await OneSignal.User.addTags(interests);
        await getInfoSignal('logout', interests);

        OneSignal.logout();
      }
    };
    logSignal(user);
  }, [user, signalPermission]);

  return {
    signalPermission,
    solicitarPermisos,
    getTags,
    setTags,
    verificarEstado,
    init,
    getInfoSignal,
    signaltoken,
    signalId,
  };
};

export default useOneSignal;
