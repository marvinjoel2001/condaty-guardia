// hooks/useNotifInstandDB.ts
import {useEffect, useMemo, useState} from 'react';
import {id, init} from '@instantdb/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEvent} from './useEvent';
import useAuth from './useAuth';
import configApp from '../../src/config/config';

let last: any = 0;
let db: any = null;

export const initSocket = () => {
  if (!db) {
    db = init({
      appId: configApp.APP_INSTANTDB_APP_ID,
    });
    console.log('iniciando conexión a InstantDB');
  } else {
    console.log('recuperando conexión a InstantDB');
  }
  return db;
};

initSocket();

export type NotifType = {
  user: Record<string, any>;
  notifs: Record<string, any>[];
  // showToast: Function;
  // sendNotif: (channel: string, event: string, payload: any) => any;
  lastNotif: number | null;
};

const channelGral: string = configApp.APP_PUSHER_BEAMS_INTEREST_PREFIX;

const useNotifInstandDB = (channels: {channel: string}[] = []): NotifType => {
  const {user, showToast} = useAuth();
  const chiam =
    channelGral + '-' + configApp.APP_AUTH_IAM.replace('/', '') + user?.id;

  const [lastNotif, setLastNotif] = useState<number | null>(null);
  const {dispatch} = useEvent('onNotif');

  const query = {
    notif: {
      $: {
        where: {
          or: [
            {channel: channelGral},
            {channel: channelGral + user?.client_id},
            {channel: chiam},
            {channel: channelGral + user?.client_id + '-guards'},
            {channel: channelGral + user?.client_id + '-alerts-1'},
            {channel: channelGral + user?.client_id + '-alerts-2'},
            {channel: channelGral + user?.client_id + '-alerts-3'},
            ...channels,
          ],
        },
        limit: 2,
        order: {
          serverCreatedAt: 'desc',
        },
      },
    },
  };
  // console.log('query', user && user.id ? query : 'nada', user, channelGral);
  const {data} = db.useQuery(user && user.id ? query : null);
  // const {data} = db.useQuery(query);

  // Load last notif timestamp from AsyncStorage
  useEffect(() => {
    const loadLast = async () => {
      try {
        const stored = await AsyncStorage.getItem('lastNotifInstantDB');
        // console.log('stored', stored);
        last = stored && stored != 'undefined' ? Number(stored) : 0;
        setLastNotif(last);
      } catch (err) {
        console.error('Error loading lastNotifInstantDB', err);
      }
      // console.log('lastNotif efeft*****', last);
    };
    loadLast();
  }, []);

  useEffect(() => {
    if (data?.notif?.length > 0) {
      const latestNotif = data.notif[0];
      // console.log(
      //   'latestNotif',
      //   latestNotif,
      //   lastNotif,
      //   lastNotif && latestNotif.created_at > lastNotif,
      //   latestNotif.created_at,
      // );
      if (lastNotif && latestNotif.created_at > lastNotif) {
        // console.log('notif enviada', data);
        dispatch(latestNotif);
        last = latestNotif.created_at;
        AsyncStorage.setItem('lastNotifInstantDB', String(last));
      }
      setLastNotif(last);
    }
  }, [data?.notif]);

  const sendNotif = async (channel: string, event: string, payload: any) => {
    await db.transact(
      db.tx.notif[id()].update({
        from: user.id,
        payload,
        channel,
        event,
        created_at: Date.now(),
      }),
    );
  };

  const result = useMemo(() => {
    return {
      user,
      notifs: data?.notif,
      // showToast,
      // sendNotif,
      lastNotif,
    };
  }, [data?.notif, user, lastNotif]);

  return result;
};

export default useNotifInstandDB;
