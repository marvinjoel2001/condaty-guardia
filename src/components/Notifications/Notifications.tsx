import React, {useEffect, useState} from 'react';
import Layout from '../../../mk/components/layout/Layout';
import TabsButtons from '../../../mk/components/ui/TabsButton/TabsButton';
import DataSearch from '../../../mk/components/ui/DataSearch';
import List from '../../../mk/components/ui/List/List';
import configApp from '../../config/config';
import useAuth from '../../../mk/hooks/useAuth';
import useApi from '../../../mk/hooks/useApi';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {cssVar} from '../../../mk/styles/themes';
import {
  IconAlertNotification,
  IconConfirmVisit,
  IconDelivery,
  IconOther,
  IconRejectVisit,
  IconSend,
  IconSesionDel,
  IconTaxi,
  IconVehicle,
  IconVisit,
} from '../../icons/IconLibrary';
import {TouchableOpacity, View} from 'react-native';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';
import {getDateTimeStrMes, getNow} from '../../../mk/utils/dates';
import {useEvent} from '../../../mk/hooks/useEvent';
import {useFocusEffect} from '@react-navigation/native';

const Notifications = () => {
  const [tab, setTab] = useState('T');
  const [search, setSearch] = useState('');
  const [dataFilter, setDataFilter] = useState([]);
  const {user} = useAuth();
  const [params, setParams]: any = useState({
    perPage: -1,
    page: 1,
    fullType: 'L',
  });
  const {
    data: notifs,
    loaded,
    reload,
  } = useApi('/notifications', 'GET', params);

  const {dispatch}: any = useEvent('onResetNotif');
  useFocusEffect(
    React.useCallback(() => {
      reload();
      dispatch('hola');
    }, []),
  );

  const NotifisList = (notifi: any) => {
    let data = JSON.parse(notifi.message);
    if (
      search != '' &&
      (data.msg?.body + '').toLowerCase().indexOf(search.toLowerCase()) == -1
    )
      return null;
    // if (
    //   !(
    //     tab === 'T' ||
    //     (tab === 'Y' &&
    //       notifi.channel ===
    //         (configApp.APP_AUTH_IAM as string).replace('/', '') + user?.id) ||
    //     (tab === 'G' && notifi.channel === 'guards') ||
    //     (tab === 'A1' && notifi.channel === 'alerts-1') ||
    //     (tab === 'A2' && notifi.channel === 'alerts-2') ||
    //     (tab === 'A3' && notifi.channel === 'alerts-3')
    //   )
    // )
    //   return null;

    /// ---------------------------------------------------------------------------------------
    ///  REVISAR LOS ICONOS SE HIZO UN PARCHE PARA LOS SVG DE LOS ICONOS PONER LOS ADECUADOS
    ///---------------------------------------------------------------------------------------
    const left = (data: any) => {
      let image = '';
      let name = '';
      console.log('mis notificaciones para alert test', data);
      if (data.info?.act == 'alerts') {
        return (
          <Icon
            style={{
              borderRadius: 50,
              padding: 8,
              backgroundColor: cssVar.cWhite,
            }}
            color={cssVar.cError}
            name={IconAlertNotification}
          />
        );
      }
      if (data.info?.act == 'in-pedido') {
        return (
          <Icon
            style={{
              borderRadius: 50,
              padding: 8,
              backgroundColor: cssVar.cWhite,
            }}
            color={cssVar.cSuccess}
            name={
              data.info?.ped_type == 1
                ? IconDelivery
                : data.info?.ped_type == 2
                ? IconTaxi
                : IconOther
            }
          />
        );
      }
      if (data.info?.act == 'confirm' && data.info?.confirm == 'Y') {
        return (
          <Icon
            style={{
              borderRadius: 50,
              padding: 8,
              backgroundColor: cssVar.cWhite,
            }}
            fillStroke={cssVar.cSuccess}
            color={'transparent'}
            name={IconConfirmVisit}
          />
        );
      }
      if (data.info?.act == 'confirm' && data.info?.confirm == 'N') {
        return (
          <Icon
            style={{
              borderRadius: 50,
              padding: 8,
              backgroundColor: cssVar.cWhite,
            }}
            fillStroke={cssVar.cError}
            color={'transparent'}
            name={IconRejectVisit}
          />
        );
      }
      if (data.info?.act == 'sessionDel') {
        return (
          <Icon
            style={{
              borderRadius: 50,
              padding: 8,
              backgroundColor: cssVar.cWhite,
            }}
            color={cssVar.cError}
            name={IconSesionDel}
          />
        );
      }
      if (data.info?.act == 'in-visitQ') {
        return (
          <Icon
            style={{
              borderRadius: 50,
              padding: 8,
              backgroundColor: cssVar.cWhite,
              transform: [{rotateY: '180deg'}],
            }}
            color={cssVar.cSuccess}
            name={IconVisit}
          />
        );
      }
      if (data.info?.act == 'out-visit') {
        return (
          <Icon
            style={{
              borderRadius: 50,
              padding: 8,
              backgroundColor: cssVar.cWhite,
            }}
            color={cssVar.cError}
            name={IconVisit}
          />
        );
      }
      if (data.info?.act == 'new-visit') {
        return (
          <Icon
            style={{
              borderRadius: 50,
              padding: 8,
              backgroundColor: cssVar.cWhite,
            }}
            color={cssVar.cSuccess}
            name={IconVehicle}
          />
        );
      }
      if (data.info?.act == 'in-visitG') {
        return (
          <Icon
            style={{
              borderRadius: 50,
              padding: 8,
              backgroundColor: cssVar.cWhite,
            }}
            // fillStroke={cssVar.cError}
            fillStroke={cssVar.cSuccess}
            color={'transparent'}
            name={IconConfirmVisit}
          />
        );
      }
      if (data.info?.act == 'in-visit') {
        return (
          <Icon
            style={{
              borderRadius: 50,
              padding: 8,
              backgroundColor: cssVar.cWhite,
            }}
            // fillStroke={cssVar.cError}
            fillStroke={cssVar.cSuccess}
            color={'transparent'}
            name={IconConfirmVisit}
          />
        );
      }

      return <Avatar src={image} name={name} />;
    };
    const msg = Array.isArray(data.msg) ? data.msg[0] : data.msg;
    return (
      <TouchableOpacity
      // onPress={() => {
      //   goNotif(data);
      // }}
      >
        <ItemList
          //   style={read ? {opacity: 0.5} : {}}
          title={msg?.title}
          subtitle={msg?.body}
          date={getDateTimeStrMes(notifi.created_at)}
          widthMain="70%"
          left={left(data)}></ItemList>
      </TouchableOpacity>
    );
  };
  const onSearch = (search: string) => {
    setSearch(search);
  };

  useEffect(() => {
    const channelMap: {[key: string]: string} = {
      G: 'guards',
      A1: 'alerts-1',
      A2: 'alerts-2',
      A3: 'alerts-3',
    };

    if (tab === 'T') {
      setDataFilter(notifs?.data);
      return;
    }

    if (tab === 'Y') {
      setDataFilter(
        notifs?.data?.filter(
          (notif: any) =>
            notif.channel ===
            `${(configApp.APP_AUTH_IAM as string).replace('/', '')}${user?.id}`,
        ),
      );
      return;
    }
    setDataFilter(
      notifs?.data?.filter((notif: any) => notif.channel === channelMap[tab]),
    );
  }, [tab, notifs?.data]);

console.log("mi loaded",loaded)
console.log("mi notifi",notifs)
  return (
    <Layout title="Notificaciones" refresh={() => reload()}>
      <TabsButtons
        tabs={[
          {value: 'T', text: 'Todo'},
          {value: 'Y', text: 'Mis Notificaciones'},
          {value: 'G', text: 'Guardias'},
          {value: 'A1', text: 'Alertas Nivel Bajo'},
          {value: 'A2', text: 'Alertas Nivel Medio'},
          {value: 'A3', text: 'Alertas Nivel Alto'},
        ]}
        sel={tab}
        setSel={setTab}
      />
      <View style={{padding: cssVar.spL, gap: cssVar.spL}}>
        <DataSearch setSearch={onSearch} name="Novedades" value={search} />

        <List data={dataFilter} renderItem={NotifisList} refreshing={!loaded} skeletonType='list'/>
      </View>
    </Layout>
  );
};

export default Notifications;
