//initProject
import {OneSignal} from 'react-native-onesignal';
import {useCallback, useEffect} from 'react';
import useAuth from '../../mk/hooks/useAuth';
import {useEvent} from '../../mk/hooks/useEvent';
import { navigationRef } from '../navigators/navigationRef';

const InitProject = () => {
  const {showToast, logout,user} = useAuth();
  const {dispatch} = useEvent('onReload');
  // para rcibir notificaciones
  const onNotif = useCallback((data: any) => {

    if (data?.event === 'ping') {
      showToast('se recibio Ping');
    }
    let info;
    try {
      info = JSON.parse(data?.payload);
    } catch (error: unknown) {
      info = data?.payload;
    }

    if (data?.event === 'reload') {
      dispatch(info);
    }

    // if (data?.event === 'new-visit' && info.type === 'P') {
    //   showToast('¡Un pedido ingreso!', 'info');
    // }
    // if (data?.event === 'in-visit') {
    //   showToast('Visitante en el condominio', 'info');
    // }
    // if (data?.event === 'in-visit-key') {
    //   showToast('¡Bienvenido a casa!', 'warning');
    // }
    if (data?.event === 'alerts') {
      if (info.user_id !== user?.id) {
        showToast(`¡Hay una nueva alerta!`, 'warning');
      }

    }
    // if (data?.event === 'in-visitG') {
    //   // QR grupal
    //   showToast('¡Un visitante Ingreso!', 'info');
    // }
    // if (data?.event === 'in-visitQ') {
    //   // QR individual y sin Qr
    //   showToast('¡Un visitante Ingreso!', 'warning');
    // }
    if (data?.event === 'in-pedido') {
      showToast('¡Un pedido está en espera!', 'info');
    }
    // if (data?.event === 'out-visit') {
    //   let text =
    //     info.type === 'P'
    //       ? '¡Un pedido salió del condominio!'
    //       : '¡Un visitante salió del condominio!';

    //   showToast(text, 'info');
    // }
    if (data?.event === 'sessionDel') {
      logout();
    }
  }, []);
  useEvent('onNotif', onNotif);
  /// hasat aqui notificaciones
  useEffect(() => {
    // register handlers and keep references so we can remove them
    const handleClick = (event: any) => {
      try {
        
        const data: any = event.notification?.additionalData || null;

        const params = {fromPush: true, pushData: data};
        if (navigationRef.isReady()) {
          navigationRef.navigate('Notifications', params);
        } else {
          setTimeout(() => {
            navigationRef.navigate('Notifications', params);
          }, 300);
        }
      } catch (e) {
        // swallow errors in handler
      }
    };

    const handleForeground = (event: any) => {
      try {
        event.getNotification().display();
        const data: any = event.notification?.additionalData || null;
        if (data && data.act == 'alerts') {
          // navigationRef.current?.navigate('Alertas');
        }
      } catch (e) {}
    };

    OneSignal.Notifications.addEventListener('click', handleClick);
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', handleForeground);

    return () => {
      try {
        OneSignal.Notifications.removeEventListener('click', handleClick);
      } catch (e) {}
      try {
        OneSignal.Notifications.removeEventListener('foregroundWillDisplay', handleForeground);
      } catch (e) {}
      try {
        OneSignal.Notifications.clearAll();
      } catch (e) {}
    };
  }, []);

  return <></>;
};

export default InitProject;
