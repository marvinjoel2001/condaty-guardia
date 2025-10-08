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
    console.log('onNotif**********', data);

    if (data?.event === 'ping') {
      showToast('se recibio Ping');
    }
    let info;
    try {
      info = JSON.parse(data?.payload);
    } catch (error: unknown) {
      // console.log('Error parsing notification payload:', error);
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
    if (data?.event === 'confirm') {
      showToast('¡Una visita fue confirmada!', 'success');
    }

    if (data?.event === 'sessionDel') {
      logout();
    }
  }, []);
  useEvent('onNotif', onNotif);
  /// hasat aqui notificaciones

  useEffect(() => {
    OneSignal.Notifications.addEventListener('click', event => {
      console.log('OneSignal: notification clicked:', event);
      const data: any = event.notification?.additionalData || null;

      const params = {fromPush: true, pushData: data};
      if (navigationRef.isReady()) {
        navigationRef.navigate('Notifications', params);
      } else {
        setTimeout(() => {
          navigationRef.navigate('Notifications', params);
        }, 300);
      }
      // const data: any = event.notification?.additionalData || null;
      // if (data) {
      //   switch (data.act) {
      //     case 'new-visit':
      //       navigator.navigate('Pending', {act: 'acceso', id: data.id});
      //       break;
      //     case 'alerts':
      //       navigator?.navigate('Alertas');
      //       break;
      //     case 'in-visit':
      //       navigator?.navigate('Pending', {
      //         act: 'acceso',
      //         id: data.access_id,
      //       });
      //       break;
      //     case 'newExpensa':
      //       navigator.navigate('ExpensesPayments');
      //       break;
      //     case 'confirmPayment':
      //       navigator.navigate('Historial', {
      //         act: 'pago',
      //         confirm: data.confirm,
      //         id: data.id,
      //       });
      //       break;
      //     case 'in-pedido':
      //       navigator.navigate('Pending', {
      //         act: 'acceso',
      //         id: data.id,
      //       });
      //       break;
      //     case 'out-visit':
      //       navigator.navigate('Historial', {
      //         act: 'acceso',
      //         id: data.id,
      //       });
      //       break;
      //     default:
      //       break;
      //   }
      // }
    });

    OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
      event.getNotification().display();
      const data: any = event.notification?.additionalData || null;
      if (data) {
        if (data.act == 'alerts') {
          // navigationRef.current?.navigate("Alertas");
        }
      }
    });

    return () => {
      OneSignal.Notifications.clearAll();
    };
  }, []);

  return (
    <>
      {/* {openAlert.open && openAlert.id != '' && (
        <AlertDetails
          id={openAlert.id}
          open={openAlert.open}
          close={(f: boolean) => setOpenAlert({open: f, id: ''})}
        />
      )} */}
      {/* {openMedal.open && (
        <ModalCongratulationMedal
          item={openMedal.item}
          open={openMedal.open}
          onClose={() => setOpenMedal({open: false, item: ''})}
        />
      )} */}
    </>
  );
};

export default InitProject;
