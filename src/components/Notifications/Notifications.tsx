import React, {useState} from 'react';
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
  IconSesionDel,
  IconTaxi,
} from '../../icons/IconLibrary';
import {TouchableOpacity} from 'react-native';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';
import {getDateTimeStrMes, getNow} from '../../../mk/utils/dates';

const Notifications = () => {
  const [tab, setTab] = useState('T');
  const [search, setSearch] = useState('');
  const {user} = useAuth();
  const [params, setParams]: any = useState({
    perPage: -1,
    page: 1,
    sortBy: 'created_at',
    orderBy: 'desc',
    searchBy:
      '|channel,=,' +
      (configApp.APP_AUTH_IAM as string).replace('/', '') +
      user?.id +
      ',o,,|channel,=,guards,o,,|channel,=,alerts-1,o,,|channel,=,alerts-2,o,,|channel,=,alerts-3,',
  });
  const {
    data: notifs,
    loaded,
    reload,
  } = useApi('/notifications', 'GET', params);

  const NotifisList = (notifi: any) => {
    // const read: boolean = readed[notifi.id] || false;
    let data = JSON.parse(notifi.message);
    if (
      search != '' &&
      (data.msg?.body + '').toLowerCase().indexOf(search.toLowerCase()) == -1
    )
      return null;
    if (
      !(
        tab === 'T' ||
        (tab === 'Y' &&
          notifi.channel ===
            (configApp.APP_AUTH_IAM as string).replace('/', '') + user?.id) ||
        (tab === 'G' && notifi.channel === 'guards') ||
        (tab === 'A1' && notifi.channel === 'alerts-1') ||
        (tab === 'A2' && notifi.channel === 'alerts-2') ||
        (tab === 'A3' && notifi.channel === 'alerts-3')
      )
    )
      return null;

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
      // console.log('data',name,image,JSON.stringify(data.info,null,5));
      return <Avatar src={image} name={name} />;
    };
    return (
      <TouchableOpacity
      // onPress={() => {
      //   goNotif(data);
      // }}
      >
        <ItemList
          //   style={read ? {opacity: 0.5} : {}}
          title={data.msg?.title}
          subtitle={data.msg?.body}
          date={getDateTimeStrMes(notifi.created_at)}
          widthMain="70%"
          left={left(data)}></ItemList>
      </TouchableOpacity>
    );
  };
  const onSearch = (search: string) => {
    setSearch(search);
  };

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
      <DataSearch setSearch={onSearch} name="Novedades" value={search} />

      <List data={notifs?.data} renderItem={NotifisList} refreshing={!loaded} />
    </Layout>
  );
};

export default Notifications;
