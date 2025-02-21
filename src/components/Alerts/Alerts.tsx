import React, {useState} from 'react';
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

const Alerts = () => {
  const [search, setSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('T');
  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState({open: false, id: null});
  const [params, setParams]: any = useState({
    perPage: -1,
    page: 1,
    sortBy: 'created_at',
    orderBy: 'desc',
    relations: 'guardia:id,ci,name,middle_name,last_name,mother_last_name',
    searchBy: '',
  });

  const {
    data: alertas,
    reload,
    execute,
    loaded,
    waiting,
  } = useApi('/alerts', 'GET', params);

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
          width: 85,
        }}>
        <Text
          style={{
            color: cssVar.cWhite,
            fontSize: 12,
            textAlign: 'center',
          }}>
          {alerta.level == 1
            ? 'Nivel bajo'
            : alerta.level == 2
            ? 'Nivel medio'
            : 'Nivel alto'}
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
    if (
      !(
        typeSearch === 'T' ||
        (typeSearch === 'NA' && alerta.level === 3) ||
        (typeSearch === 'NM' && alerta.level === 2) ||
        (typeSearch === 'NB' && alerta.level === 1)
      )
    )
      return null;

    return (
      <TouchableOpacity
        onPress={() => {
          setOpenView({open: true, id: alerta.id});
        }}>
        <ItemList
          style={{backgroundColor: cssVar.cBlackV2}}
          title={getFullName(alerta.guardia)}
          subtitle="Guardia"
          date={getDateTimeStrMes(alerta.created_at)}
          left={
            <Avatar
              src={getUrlImages(
                '/GUA-' + alerta.guardia?.id + '.png?d=' + alerta?.updated_at,
              )}
              name={getFullName(alerta.guardia)}
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
      </TouchableOpacity>
    );
  };

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

          {alertas?.data.length == 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{color: cssVar.cWhiteV1}}>
                Aquí se verá tu lista
              </Text>
            </View>
          ) : (
            <List
              style={{marginTop: 8}}
              data={alertas?.data}
              renderItem={alertList}
              refreshing={!loaded}
            />
          )}
        </View>
        <AlertAdd
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          reload={reload}
        />
      </Layout>
      <IconFloat onPress={() => setOpenAdd(true)} />
    </>
  );
};

export default Alerts;
