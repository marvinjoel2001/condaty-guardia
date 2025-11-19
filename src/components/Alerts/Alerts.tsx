import React, {useEffect, useState} from 'react';
import Layout from '../../../mk/components/layout/Layout';
import TabsButtons from '../../../mk/components/ui/TabsButton/TabsButton';
import DataSearch from '../../../mk/components/ui/DataSearch';
import {Text, View} from 'react-native';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import ListFlat from '../../../mk/components/ui/List/ListFlat';
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

const paramsInitial = {
  perPage: 30,
  page: 1,
  fullType: 'L',
  searchBy: '',
  filterBy: 'ALL',
};

const Alerts = () => {
  const [search, setSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('T');
  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState({open: false, id: null});
  const [params, setParams]: any = useState(paramsInitial);
  const [accumulatedData, setAccumulatedData] = useState<any[]>([]);

  const {data: alertas, reload, loaded} = useApi('/alerts', 'GET', params, 3);

  useEffect(() => {
    if (alertas?.data) {
      if (params.page === 1) {
        setAccumulatedData(alertas.data);
      } else {
        setAccumulatedData(prev => [...prev, ...alertas.data]);
      }
    }
  }, [alertas?.data]);

  const onSearch = (value: string) => {
    setSearch(value);
    setAccumulatedData([]);
    if (value == '') {
      setParams({...paramsInitial, filterBy: params.filterBy});
      return;
    }
    setParams({
      ...params,
      page: 1,
      searchBy: value,
    });
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
      setAccumulatedData([]);
      setParams({
        ...params,
        filterBy: 'ALL',
        page: 1,
      });
    }
    if (typeSearch === 'NA') {
      setAccumulatedData([]);
      setParams({
        ...params,
        filterBy: '3',
        page: 1,
      });
    }
    if (typeSearch === 'NM') {
      setAccumulatedData([]);
      setParams({
        ...params,
        filterBy: '2',
        page: 1,
      });
    }
    if (typeSearch === 'NB') {
      setAccumulatedData([]);
      setParams({
        ...params,
        filterBy: '1',
        page: 1,
      });
    }
    if (typeSearch === 'P') {
      setAccumulatedData([]);
      setParams({
        ...params,
        filterBy: '4',
        page: 1,
      });
    }
  }, [typeSearch]);

  useEffect(() => {
    reload(params);
  }, [params]);

  const handleReload = () => {
    setParams({...paramsInitial, filterBy: params.filterBy});
    setAccumulatedData([]);
  };
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

          <ListFlat
            data={accumulatedData}
            renderItem={alertList}
            onRefresh={handleReload}
            refreshing={params.page === 1 && !loaded}
            loading={!loaded}
            setParams={setParams}
            stopPagination={
              alertas?.message?.total == -1 &&
              alertas?.data?.length < params.perPage
            }
            emptyLabel="No hay alertas"
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
