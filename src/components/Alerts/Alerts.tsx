import React, {useEffect, useState} from 'react';
import Layout from '../../../mk/components/layout/Layout';
import TabsButtons from '../../../mk/components/ui/TabsButton/TabsButton';
import DataSearch from '../../../mk/components/ui/DataSearch';
import {Text, TouchableOpacity, View} from 'react-native';
import {cssVar} from '../../../mk/styles/themes';
import List from '../../../mk/components/ui/List/List';
import useApi from '../../../mk/hooks/useApi';
import {getFullName, getUrlImages} from '../../../mk/utils/strings';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {getDateTimeStrMes} from '../../../mk/utils/dates';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';
import IconFloat from '../../../mk/components/ui/IconFLoat/IconFloat';
import AlertAdd from './AlertAdd';
import AlertDetail from './AlertDetail';

export const levelAlerts = ['', 'bajo', 'medio', 'alto', 'panico'];

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
          backgroundColor:
            alerta.level == 3
              ? cssVar.cError
              : alerta.level == 2
              ? cssVar.cWarning
              : cssVar.cSuccess,
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 12,
        }}>
        <Text
          style={{
            color: cssVar.cWhite,
            fontSize: 12,
            textAlign: 'center',
          }}>
          {'Nivel ' + levelAlerts[alerta.level]}
        </Text>
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
    const prefix = alerta.level === 4 ? '/OWNER-' : '/GUARD-';

    return (
      <ItemList
        onPress={() => {
          setOpenView({open: true, id: alerta.id});
        }}
        title={getFullName(user)}
        subtitle="Informador"
        date={getDateTimeStrMes(alerta.created_at)}
        left={
          <Avatar
            src={getUrlImages(
              prefix + user?.id + '.webp?d=' + user?.updated_at,
            )}
            name={getFullName(user)}
          />
        }
        right={renderRight(alerta)}>
        <View style={{paddingTop: 8}}>
          <Text style={{color: cssVar.cWhite}}>Asunto</Text>
          <Text
            style={{
              color: cssVar.cWhiteV2,
              fontSize: 10,
              fontWeight: '400',
            }}>
            {alerta.descrip}
          </Text>
        </View>
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
        <View style={{paddingHorizontal: 16}}>
          <DataSearch setSearch={onSearch} name="Novedades" value={search} />

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
