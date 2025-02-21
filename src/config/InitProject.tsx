import {OneSignal} from 'react-native-onesignal';
import {usePusher} from '../../mk/contexts/PusherContext';
import {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {AlertDetail} from '../components/Alerts/AlertDetail';
// import AlertDetails from "./AlertDetails";

const InitProject = () => {
  const {pusher, socketNew, socketEvent} = usePusher();
  const navigator: any = useNavigation();

  useEffect(() => {
    if (!pusher) return;
    console.log('useEffect project', pusher?.connectionState);
    OneSignal.Notifications.addEventListener('click', event => {
      const data: any = event.notification?.additionalData || null;
      console.log('OneSignal: notification clicked in useeffect:', data, event);
      if (data) {
        if (data.act == 'confirm') {
          navigator?.navigate('Home', {
            act: 'access',
            access_id: data?.id,
          });
        }
        if (data.act == 'in-pedido') {
          navigator?.navigate('Home', {
            act: 'pedido',
            pedido_id: data?.pedido_id,
          });
        }
        if (data.act == 'alerts') {
          navigator?.navigate('Alertas', {
            act: 'alerts',
            id: data?.id,
          });
        }
      }
    });

    OneSignal.Notifications.addEventListener('foregroundWillDisplay', event => {
      console.log('OneSignal foreground:', event);
      event.getNotification().display();
      const data: any = event.notification?.additionalData || null;
      if (data) {
        if (data.act == 'alerts') {
          // navigator.navigate("Alertas");
        }
      }
    });

    return () => {
      OneSignal.Notifications.clearAll();
    };
  }, [pusher]);

  const [openAlert, setOpenAlert] = useState({open: false, id: ''});
  useEffect(() => {
    console.log('socket event layout', socketEvent);
    if (!socketEvent) return;
    if (socketEvent.act == 'alerts') {
      setOpenAlert({open: true, id: socketEvent.id});
    }
    // if (socketEvent.act == "new-visit") {
    //   setStore((old: any) => ({...old, socket: null}));
    //   if (!store?.openConfirm?.open) {
    //     ``;
    //     setStore((old: any) => ({
    //       ...old,
    //       openConfirm: {open: true, id: socketEvent.id},
    //     }));
    //   }
    // }
  }, [socketNew]);
  return (
    <>
      {openAlert.open && openAlert.id != '' && (
        <AlertDetail
          id={openAlert.id}
          open={openAlert.open}
          onClose={() => setOpenAlert({open: false, id: ''})}
        />
      )}
    </>
  );
};

export default InitProject;
