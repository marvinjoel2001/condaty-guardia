import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import ListFlat from '../../../../mk/components/ui/List/ListFlat';
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import OrdersDetail from './OrdersDetail';
import DataSearch from '../../../../mk/components/ui/DataSearch';
import DateAccess from '../DateAccess/DateAccess';
import useApi from '../../../../mk/hooks/useApi';

const getOrderTypeName = (typeId: number | string): string => {
  const id = Number(typeId);
  switch (id) {
    case 1:
      return 'Delivery';
    case 2:
      return 'Taxi';
    default:
      return 'Otro';
  }
};

const paramsInitial = {
  perPage: 30,
  page: 1,
  fullType: 'L',
  section: 'ACT',
  searchBy: '',
};

export const Orders = () => {
  const [openDetail, setOpenDetail] = useState({
    open: false,
    id: null as number | string | null,
  });
  const [search, setSearch] = useState('');
  const [params, setParams] = useState(paramsInitial);
  const [accumulatedData, setAccumulatedData] = useState<any[]>([]);
  const {data, reload, loaded} = useApi('/others', 'GET', params, 3);

  useEffect(() => {
    reload(params);
  }, [params]);
  useEffect(() => {
    if (data?.data) {
      if (params.page === 1) {
        setAccumulatedData(data.data);
      } else {
        setAccumulatedData(prev => [...prev, ...data.data]);
      }
    }
  }, [data]);
  // Dejamos esta funcion por si la volvemos a ocupar 07/11/2025
  // const removeAccents = (str: string) => {
  //   return str
  //     ?.normalize('NFD')
  //     ?.replace(/[\u0300-\u036f]/g, '')
  //     ?.toLowerCase();
  // };
  const renderItem = (item: any) => {
    const visitFullName = getFullName(item?.access?.visit);
    const orderTypeString = 'Pedido: ' + getOrderTypeName(item?.other_type_id);

    return (
      <ItemList
        onPress={() => setOpenDetail({open: true, id: item.id})}
        key={item.id}
        title={visitFullName}
        subtitle={orderTypeString}
        left={
          <Avatar
            hasImage={item?.access?.visit?.has_image}
            name={visitFullName}
            src={getUrlImages(
              '/VISIT-' +
                item?.access?.visit?.id +
                '.webp?d=' +
                item?.access?.visit?.updated_at,
            )}
          />
        }
        right={<DateAccess access={item.access} />}
        style={styles.customItemListStyle}
      />
    );
  };

  const onSearch = (value: string) => {
    setSearch(value);
    setAccumulatedData([]);
    if (value == '') {
      setParams(paramsInitial);
      return;
    }
    setParams({
      ...params,
      page: 1,
      searchBy: value,
    });
  };
  const handleReload = () => {
    setParams(paramsInitial);
    setAccumulatedData([]);
  };
  return (
    <View style={styles.pageContainer}>
      <DataSearch
        setSearch={onSearch}
        name="orders"
        value={search}
        style={{marginBottom: 8}}
      />
      <ListFlat
        data={accumulatedData}
        renderItem={renderItem}
        refreshing={params.page === 1 && !loaded}
        emptyLabel="No hay datos"
        onRefresh={handleReload}
        loading={!loaded}
        setParams={setParams}
        stopPagination={
          data?.message?.total == -1 && data?.data?.length < params.perPage
        }
      />
      {openDetail.open && (
        <OrdersDetail
          open={openDetail.open}
          onClose={() => setOpenDetail({open: false, id: null})}
          id={openDetail?.id as number | null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  customItemListStyle: {
    backgroundColor: '#414141',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  avatarView: {
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#212121',
    fontSize: 16,
    fontWeight: '600',
  },
});
