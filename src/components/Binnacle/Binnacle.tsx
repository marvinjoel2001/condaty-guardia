import React, {useState} from 'react';
import Layout from '../../../mk/components/layout/Layout';
import DataSearch from '../../../mk/components/ui/DataSearch';
import List from '../../../mk/components/ui/List/List';
import useApi from '../../../mk/hooks/useApi';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {getFullName, getUrlImages} from '../../../mk/utils/strings';
import {Text, TouchableOpacity, View} from 'react-native';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';
import {cssVar} from '../../../mk/styles/themes';
import IconFloat from '../../../mk/components/ui/IconFLoat/IconFloat';
import BinnacleAdd from './BinnacleAdd';
import BinnacleDetail from './BinnacleDetail';

const Binnacle = () => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openView, setOpenView] = useState({open: false, item: null});
  const [search, setSearch] = useState('');
  const {data, reload, execute, loaded} = useApi(
    '/guardnews',
    'GET',
    {
      fulType: 'L',
    },
    3,
  );

  const novedadList = (novedad: any) => {
    if (
      search != '' &&
      (novedad.descrip + '').toLowerCase().indexOf(search.toLowerCase()) == -1
    )
      return null;
    return (
      <ItemList
        onPress={() => setOpenView({open: true, item: novedad})}
        title={getFullName(novedad.guardia)}
        subtitle={'Bitácoras'}
        // right={
        //   <Icon
        //     style={{padding: 5}}
        //     name={IconOptions}
        //     color={"white"}
        //     onPress={() => {
        //       setOpenDropdown(true);
        //     }}
        //   />
        // }
        left={
          <Avatar
            src={getUrlImages(
              '/GUA-' + novedad.guardia.id + '.png?d=' + novedad?.updated_at,
            )}
            name={getFullName(novedad.guardia)}
          />
        }>
        <View style={{paddingTop: 8}}>
          <Text style={{color: cssVar.cWhite}}>Descripción</Text>
          <Text
            style={{
              color: cssVar.cWhiteV2,
              fontSize: 10,
              fontWeight: '400',
            }}>
            {novedad.descrip}
          </Text>
        </View>
      </ItemList>
    );
  };

  const onSearch = (search: string) => {
    setSearch(search);
  };
  return (
    <>
      <Layout title="Bitácora">
        <View style={{paddingHorizontal: 16}}>
          <DataSearch
            setSearch={onSearch}
            name="Bitácora"
            style={{marginVertical: 8}}
            value={search}
          />
          <List
            data={data?.data}
            renderItem={novedadList}
            refreshing={!loaded}
          />
        </View>
        {openAdd && (
          <BinnacleAdd
            open={openAdd}
            onClose={() => setOpenAdd(false)}
            reload={reload}
          />
        )}
        {openView.open && (
          <BinnacleDetail
            open={openView.open}
            onClose={() => setOpenView({open: false, item: null})}
            item={openView?.item}
          />
        )}
      </Layout>
      {!openAdd && <IconFloat onPress={() => setOpenAdd(true)} />}
    </>
  );
};

export default Binnacle;
