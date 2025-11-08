import React, {useEffect, useState} from 'react';
import Layout from '../../../mk/components/layout/Layout';
import TabsButtons from '../../../mk/components/ui/TabsButton/TabsButton';
import DataSearch from '../../../mk/components/ui/DataSearch';
import {Text, View} from 'react-native';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import List from '../../../mk/components/ui/List/List';
import useApi from '../../../mk/hooks/useApi';
import {getFullName, getUrlImages} from '../../../mk/utils/strings';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {getDateTimeAgo} from '../../../mk/utils/dates';
import ItemList from '../../../mk/components/ui/ItemList/ItemList';
import IconFloat from '../../../mk/components/ui/IconFLoat/IconFloat';
import AlertAdd from './AlertAdd';
import AlertDetail from './AlertDetail';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {
  ALERT_LEVEL_COLORS,
  ALERT_TABS,
  EMERGENCY_TYPES,
} from './alertConstants';

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
    const levelConfig =
      ALERT_LEVEL_COLORS[alerta?.level as keyof typeof ALERT_LEVEL_COLORS];
    return (
      <View
        style={{
          backgroundColor: levelConfig?.background,
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 4,
        }}>
        <Text
          style={{
            color: levelConfig?.color,
            fontSize: 12,
            textAlign: 'center',
          }}>
          {levelConfig?.label}
        </Text>
      </View>
    );
  };

  const renderLeft = (alerta: any) => {
    const emergencyType =
      EMERGENCY_TYPES[alerta.type as keyof typeof EMERGENCY_TYPES];

    return (
      <View
        style={{
          backgroundColor: emergencyType?.background,
          borderColor: emergencyType?.border,
          borderWidth: 1,
          padding: 8,
          borderRadius: '100%',
        }}>
        <Icon name={emergencyType?.icon} color={cssVar.cWhite} />
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
        title={
          alerta.level === 4 ? alerta.descrip : getFullName(alerta.guardia)
        }
        subtitle={
          alerta.level === 4
            ? 'Residente: ' + getFullName(user)
            : 'Guardia - ' + getDateTimeAgo(alerta.created_at)
        }
        subtitle2={
          alerta.level === 4 && alerta.owner?.dpto?.length > 0
            ? `Unidad: ${alerta.owner.dpto[0].nro}`
            : ''
        }
        left={
          alerta?.level === 4 ? (
            renderLeft(alerta)
          ) : (
            <Avatar
              hasImage={alerta?.guardia?.has_image}
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
    if (typeSearch === 'P') {
      setDataFilter(alertas?.data.filter((alerta: any) => alerta.level === 4));
    }
  }, [typeSearch, alertas?.data]);

  return (
    <>
      <Layout title="Alertas" refresh={() => reload()} scroll={false}>
        <TabsButtons
          tabs={ALERT_TABS}
          sel={typeSearch}
          setSel={setTypeSearch}
          style={{marginVertical: 12}}
        />

        <View style={{flex: 1}}>
          <DataSearch
            setSearch={onSearch}
            name="Novedades"
            value={search}
            style={{marginBottom: 8}}
          />

          <List
            style={{marginTop: 8}}
            data={dataFilter}
            renderItem={alertList}
            refreshing={!loaded}
          />
        </View>

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
