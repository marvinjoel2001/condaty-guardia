import React, {useEffect, useState} from 'react';
import Layout from '../../../mk/components/layout/Layout';
import TabsButtons from '../../../mk/components/ui/TabsButton/TabsButton';
import DataSearch from '../../../mk/components/ui/DataSearch';
import {Text, TouchableOpacity, View} from 'react-native';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import List from '../../../mk/components/ui/List/List';
import useApi from '../../../mk/hooks/useApi';
import {getFullName, getUrlImages} from '../../../mk/utils/strings';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {getDateTimeAgo, getDateTimeStrMes} from '../../../mk/utils/dates';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';
import IconFloat from '../../../mk/components/ui/IconFLoat/IconFloat';
import AlertAdd from './AlertAdd';
import AlertDetail from './AlertDetail';
import {
  IconAlert,
  IconAmbulance,
  IconFlame,
  IconTheft,
} from '../../icons/IconLibrary';
import Icon from '../../../mk/components/ui/Icon/Icon';

export const levelAlerts = ['', 'bajo', 'medio', 'alto', 'pánico'];
export const statusColor: any = {
  1: {color: cssVar.cSuccess, background: cssVar.cHoverSuccess},
  2: {color: cssVar.cWarning, background: cssVar.cHoverWarning},
  3: {color: cssVar.cError, background: cssVar.cHoverError},
  4: {color: cssVar.cError, background: cssVar.cHoverError},
};
export const statusColorPanic: any = {
  E: {border: cssVar.cError, background: cssVar.cHoverError},
  F: {border: cssVar.cWarning, background: cssVar.cHoverWarning},
  T: {border: cssVar.cAlertMedio, background: cssVar.cHoverOrange},
  O: {border: cssVar.cCompl4, background: cssVar.cHoverCompl4},
};

const Alerts = () => {
  const [search, setSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('T');
  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState({open: false, id: null});
  const [dataFilter, setDataFilter] = useState([]);
  const [params, setParams]: any = useState({
    perPage: -1,
    page: 1,
    fullType: 'L',
  });

  const {data: alertas, reload, loaded} = useApi('/alerts', 'GET', params);

  const onSearch = (search: string) => {
    setSearch(search);
  };
  const renderRight = (alerta: any) => {
    return (
      <View
        style={{
          backgroundColor: statusColor[alerta?.level]?.background,
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 4,
        }}>
        <Text
          style={{
            color: statusColor[alerta?.level]?.color,
            fontSize: 12,
            textAlign: 'center',
          }}>
          {'Nivel ' + levelAlerts[alerta.level]}
        </Text>
      </View>
    );
  };
  const renderLeft = (alerta: any) => {
    let icon: any;

    switch (alerta.type) {
      case 'F':
        icon = IconFlame;
        break;
      case 'E':
        icon = IconAmbulance;
        break;
      case 'T':
        icon = IconTheft;
        break;
      case 'O':
        icon = IconAlert;
        break;
      default:
    }
    return (
      <View
        style={{
          backgroundColor: statusColorPanic[alerta?.type]?.background,
          borderColor: statusColorPanic[alerta?.type]?.border,
          borderWidth: 1,
          padding: 8,
          borderRadius: '100%',
        }}>
        <Icon name={icon} color={cssVar.cWhite} />
      </View>
    );
  };
  const alertList = (alerta: any) => {
    if (
      search != '' &&
      (alerta.descrip + '').toLowerCase().indexOf(search.toLowerCase()) == -1 &&
      (getFullName(alerta.guardia) + '')
        .toLowerCase()
        .indexOf(search.toLowerCase()) == -1
    )
      return null;

    const user = alerta.level === 4 ? alerta.owner : alerta.guardia;

    return (
      <ItemList
        onPress={() => {
          setOpenView({open: true, id: alerta.id});
        }}
        // title={getFullName(alerta.guardia)}
        title={
          alerta.level === 4
            ? alerta.descrip
            : getFullName(alerta.guardia)
        }
        subtitle={
          alerta.level === 4
            ? 'Residente: ' + getFullName(user)
            : 'Guardia - ' + getDateTimeAgo(alerta.created_at)
        }
        // subtitle2={}
        left={
          alerta?.level === 4 ? (
            renderLeft(alerta)
          ) : (
            <Avatar
              src={getUrlImages(
                '/GUARD-' +
                  alerta?.guard_id +
                  '.webp?d=' +
                  alerta?.guardia?.updated_at,
              )}
              name={getFullName(alerta.guardia)}
            />
          )
        }
        right={renderRight(alerta)}>
        {alerta?.level !== 4 && (
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              marginTop: 4,
              color: cssVar.cWhiteV1,
              fontSize: 14,
              fontFamily: FONTS.regular,
             
            }}>
            {alerta.descrip}
          </Text>
        )}
      </ItemList>
    );
  };
  useEffect(() => {
    if (typeSearch === 'T') {
      setDataFilter(alertas?.data);
    }
    if (typeSearch === 'NA') {
      setDataFilter(alertas?.data.filter((alerta: any) => alerta.level === 3));
    }
    if (typeSearch === 'NM') {
      setDataFilter(alertas?.data.filter((alerta: any) => alerta.level === 2));
    }
    if (typeSearch === 'NB') {
      setDataFilter(alertas?.data.filter((alerta: any) => alerta.level === 1));
    }
  }, [typeSearch, alertas?.data]);

  return (
    <>
      <Layout title="Alertas" refresh={() => reload()}>
        <TabsButtons
          tabs={[
            {value: 'T', text: 'Todo'},
            {value: 'NA', text: 'Nivel alto'},
            {value: 'NM', text: 'Nivel medio'},
            {value: 'NB', text: 'Nivel bajo'},
          ]}
          sel={typeSearch}
          setSel={setTypeSearch}
        />

        <DataSearch setSearch={onSearch} name="Novedades" value={search} />

        <List
          style={{marginTop: 8}}
          data={dataFilter}
          renderItem={alertList}
          refreshing={!loaded}
        />

        {openAdd && (
          <AlertAdd
            open={openAdd}
            onClose={() => setOpenAdd(false)}
            reload={reload}
          />
        )}
        {openView.open && (
          <AlertDetail
            open={openView.open}
            onClose={() => setOpenView({open: false, id: null})}
            id={openView.id}
          />
        )}
      </Layout>
      <IconFloat onPress={() => setOpenAdd(true)} />
    </>
  );
};

export default Alerts;
