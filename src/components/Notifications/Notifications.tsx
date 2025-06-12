import React, {useState} from 'react';
import Layout from '../../../mk/components/layout/Layout';
import List from '../../../mk/components/ui/List/List';
import useApi from '../../../mk/hooks/useApi';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {cssVar} from '../../../mk/styles/themes';
import {
  IconAlertNotification,
  IconConfirmVisit,
  IconDelivery,
  IconOther,
  IconRejectVisit,
  IconSesionDel,
  IconTaxi,
  IconVehicle,
  IconVisit,
} from '../../icons/IconLibrary';
import {Text} from 'react-native';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';
import {getTimeAgoSimple} from '../../../mk/utils/dates';
import {useEvent} from '../../../mk/hooks/useEvent';
import {useFocusEffect} from '@react-navigation/native';
import DetOrders from '../Home/Orders/DetOrders';
import DetAccesses from '../Home/Accesses/DetAccesses';
import AlertDetail from '../Alerts/AlertDetail';

const Notifications = () => {
  const [openDetail, setOpenDetail] = useState('');
  const [formState, setFormState]: any = useState({});
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

  const goNotif = (data: any) => {
    if (data.info?.act == 'in-pedido') {
      setFormState({id: data.info?.pedido_id});
      setOpenDetail(data.info?.pedido_id ? 'Pedidos' : '');
    }
    if (
      data.info?.act == 'out-visit' || // no deberia recibir
      data.info?.act == 'confirm' ||
      data.info?.act == 'new-visit' //no deberia recibir
    ) {
      setFormState({id: data.info?.id});
      setOpenDetail(data.info?.id ? 'Access' : '');
    }
    if (data.info?.act == 'in-visit') {
      //no deberia recibir
      setFormState({id: data.info?.access_id});
      setOpenDetail(data.info?.access_id ? 'Access' : '');
    }
    if (data.info?.act == 'alerts') {
      setFormState({id: data.info?.id});
      setOpenDetail(data.info?.id ? 'Alerts' : '');
    }
  };

  const NotifisList = (notifi: any) => {
    let data = JSON.parse(notifi.message);
    const left = (data: any) => {
      let image = '';
      let name = '';
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
      <ItemList
        //   style={read ? {opacity: 0.5} : {}}
        title={msg?.title}
        subtitle={msg?.body}
        truncateSubtitle={true}
        right={
          <Text
            style={{
              color: cssVar.cWhiteV1,
              fontSize: 10,
              alignItems: 'flex-end',
              flex: 1,
            }}>
            {getTimeAgoSimple(notifi.created_at)}
          </Text>
        }
        // date={getDateTimeStrMes(notifi.created_at)}
        onPress={() => {
          goNotif(data);
        }}
        left={left(data)}></ItemList>
    );
  };

  return (
    <Layout title="Notificaciones" refresh={() => reload()}>
      <List
        data={notifs?.data}
        renderItem={NotifisList}
        refreshing={!loaded}
        skeletonType="list"
      />

      {openDetail == 'Pedidos' && (
        <DetOrders
          id={formState?.id}
          open={openDetail == 'Pedidos'}
          close={() => setOpenDetail('')}
        />
      )}

      {openDetail == 'Access' && (
        <DetAccesses
          id={formState?.id}
          open={openDetail == 'Access'}
          close={() => setOpenDetail('')}
        />
      )}
      {openDetail == 'Alerts' && (
        <AlertDetail
          open={openDetail == 'Alerts'}
          onClose={() => setOpenDetail('')}
          id={formState.id}
        />
      )}
    </Layout>
  );
};

export default Notifications;
