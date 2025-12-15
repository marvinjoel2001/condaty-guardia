// hooks/useNotifInstandDB.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { id, init } from '@instantdb/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEvent } from './useEvent';
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

const useNotifInstandDB = (channels: { channel: string }[] = []): NotifType => {
  const { user, showToast } = useAuth();
  const chiam =
    channelGral +
    user?.client_id +
    '-' +
    configApp.APP_AUTH_IAM.replace('/', '') +
    user?.id;

  const [lastNotif, setLastNotif] = useState<number | null>(null);

  const onSendNotif = useCallback((data: any) => {
    // console.log('onSendNotif', data);
    if (data && data.length) {
      data.forEach((item: any) => {
        if (item.to && item.act) sendNotif(item.to, item.act, item);
      });
    }
  }, []);

  useEvent('sendNotif', onSendNotif);
  const { dispatch } = useEvent('onNotif');

  const query = {
    notif: {
      $: {
        where: {
          and: [
            { client_id: user?.client_id },
            {
              or: [
                { channel: channelGral },
                { channel: channelGral + user?.client_id },
                { channel: chiam },
                { channel: channelGral + user?.client_id + '-guards' },
                { channel: channelGral + user?.client_id + '-alerts-1' },
                { channel: channelGral + user?.client_id + '-alerts-2' },
                { channel: channelGral + user?.client_id + '-alerts-3' },
                ...channels,
              ],
            },
          ],
          // created_at: { $gte: new Date(last).toISOString() },
        },
        limit: 1,
        order: {
          serverCreatedAt: 'desc',
        },
      },
    },
  };
  // console.log('query', user && user.id ? query : 'nada', user, channelGral);
  const { data } = db.useQuery(user && user.id ? query : null);
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
        setLastNotif(0);
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
      //   'latestNotif2',
      //   latestNotif,
      //   lastNotif,
      //   JSON.stringify(lastNotif && latestNotif.created_at > lastNotif),
      //   latestNotif.created_at,
      // );
      if (lastNotif !== null && latestNotif.created_at > lastNotif) {
        // console.log('notif enviada', data);
        dispatch(latestNotif);
        last = latestNotif.created_at;
        AsyncStorage.setItem('lastNotifInstantDB', String(last));
      }
      setLastNotif(last);
    }
  }, [data?.notif]);

  const sendNotif = async (channel: string, event: string, payload: any) => {
    // console.log('sendNotif2', channel, event, payload);
    const channelSend = channelGral + user?.client_id + '-' + channel;
    await db.transact(
      db.tx.notif[id()].update({
        from: channelGral,
        payload,
        channel: channelSend,
        event,
        created_at: Date.now(),
        client_id: user?.client_id,
      }),
      //  from: _id,
      //   payload,
      //   channel,
      //   event,
      //   created_at: Date.now(),
      //   client_id: client_id,
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
