import {OneSignal} from 'react-native-onesignal';
import React, {useCallback, useEffect} from 'react';
import useAuth from '../../mk/hooks/useAuth';
import {useEvent} from '../../mk/hooks/useEvent';

// export const processSocket = async (
//   socketEvent: any,
//   showToast: Function,
//   setStore: Function,
// ) => {
//   // console.log('socket event init', JSON.stringify(socketEvent, null, 5));
//   if (!socketEvent) return;
//   if (socketEvent.data?.act == 'ping') {
//     showToast(socketEvent.data?.msg, 'info');
//   }
//   if (socketEvent.data?.act == 'newEvent') {
//     showToast(
//       'Nuevo Evento ha llegado' + ':\n' + socketEvent.data?.titulo,
//       'info',
//     );
//     setStore((old: any) => ({...old, nEvents: (old?.nEvents || 0) + 1}));
//   }
//   if (socketEvent.data?.act == 'newActivity') {
//     showToast(
//       'Nuevo Actividad ha llegado' + ':\n' + socketEvent.data?.titulo,
//       'info',
//     );
//     setStore((old: any) => ({...old, nActivity: (old?.nActivity || 0) + 1}));
//   }
//   if (socketEvent.data?.act == 'newContent') {
//     showToast('Nueva Noticia ha llegado', 'info');
//     setStore((old: any) => ({
//       ...old,
//       nContents: (old?.nContents || 0) + 1,
//       contentIds: [...(old?.contentIds || []), socketEvent.data?.candidate_id],
//     }));
//   }
//   if (socketEvent.data?.act == 'newSurvey') {
//     setStore((old: any) => ({...old, nSurveys: (old?.nSurveys || 0) + 1}));
//   }
//   if (socketEvent?.data?.act == 'newChatContact') {
//     setStore({nChats: socketEvent.data?.cant || 0});
//     showToast(
//       'Solicitud de contacto de ' + ':\n' + socketEvent.data?.from,
//       'info',
//     );
//   }
//   if (socketEvent?.data?.act == 'newChatMsg') {
//     setStore({nChats: socketEvent.data?.cant || 0});
//     const msg = await decryptData(
//       socketEvent.data?.msg,
//       socketEvent.data?.from_id,
//     );
//     showToast('Mensaje de ' + socketEvent.data?.from + ':\n' + msg, 'info');
//   }
//   if (socketEvent.data?.act == 'newChatAccepted') {
//     showToast(
//       'Tu solicitud fue aceptada por' + ':\n' + socketEvent.data?.from,
//       'info',
//     );
//   }
//   if (socketEvent.data?.act == 'newLevel') {
//     showToast('Subiste de NIVEL a ' + socketEvent.data?.name, 'success');
//   }
//   if (socketEvent.data?.act == 'newMedal') {
//     setStore((old: any) => ({
//       ...old,
//       nMedals: socketEvent.data,
//     }));
//   }
// };

const InitProject = () => {
  const {showToast} = useAuth();
  // para rcibir notificaciones
  const onNotif = useCallback((data: any) => {
    console.log('onNotif**********', data);
    if (data?.event === 'ping') {
      showToast('se recibio Ping');
    }
    let info;
    try {
      info = JSON.parse(data?.payload);
    } catch (error) {
      info = data?.payload;
    }

    if (data?.event === 'new-visit') {
      showToast('¡Alguien quiere visitarte!', 'info');
    }
    if (data?.event === 'in-visit') {
      showToast('Visitante en el condominio', 'info');
    }
    if (data?.event === 'in-visit-key') {
      showToast('¡Bienvenido a casa!', 'warning');
    }
    if (data?.event === 'in-visitG') {
      showToast('¡Tu visita está aquí!', 'info');
    }
    if (data?.event === 'in-visitQ') {
      showToast('¡Tu visita está aquí!', 'warning');
    }
    if (data?.event === 'in-pedido') {
      showToast('¡Tu pedido llegó al condominio!', 'info');
    }
    if (data?.event === 'out-visit') {
      let accesType = info.type === 'P' ? 'pedido' : 'visitante';
      showToast(`Su ${accesType} ${info.name} ya salió del condominio`, 'info');
    }
    if (data?.event === 'newExpensa') {
      showToast('¡Tienes una nueva expensa!', 'info');
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
