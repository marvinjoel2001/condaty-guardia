import {OneSignal} from 'react-native-onesignal';
import React, {useCallback, useEffect} from 'react';
import useAuth from '../../mk/hooks/useAuth';
import {useEvent} from '../../mk/hooks/useEvent';

const InitProject = () => {
  const {showToast} = useAuth();
  // para rcibir notificaciones
  const onNotif = useCallback((data: any) => {
    // console.log('onNotif**********', data);
    if (data?.event === 'ping') {
      showToast('se recibio Ping');
    }
  }, []);
  useEvent('onNotif', onNotif);
  /// hasat aqui notificaciones

  useEffect(() => {
    OneSignal.Notifications.addEventListener('click', event => {
      console.log('OneSignal: notification clicked:', event);
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
