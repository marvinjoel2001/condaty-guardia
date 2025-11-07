import React, {useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import ListFlat from '../../../../mk/components/ui/List/ListFlat';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
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
  perPage: 10,
  page: 1,
  fullType: 'L',
  section: 'ACT',
};

export const Orders = () => {
  const [openDetail, setOpenDetail] = useState({
    open: false,
    id: null as number | string | null,
  });
  const [search, setSearch] = useState('');
  const [params, setParams] = useState(paramsInitial);

  const {data, reload, loaded} = useApi('/others', 'GET', params, 3);

  useEffect(() => {
    reload(params);
  }, [params]);

  const removeAccents = (str: string) => {
    return str
      ?.normalize('NFD')
      ?.replace(/[\u0300-\u036f]/g, '')
      ?.toLowerCase();
  };
  const renderItem = (item: any) => {
    if (search && search !== '') {
      if (
        !removeAccents(getFullName(item?.access?.visit)).includes(
          removeAccents(search),
        ) &&
        !removeAccents(item?.other_type?.name).includes(removeAccents(search))
      ) {
        return null;
      }
    }

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
  };
  const handleReload = () => {
    setParams(paramsInitial);
  };
  const onPagination = () => {
    const total = data?.message?.total || 0;
    const currentLength = data?.data?.length || 0;
    const maxPage = Math.ceil(total / params.perPage);

    if (currentLength >= total || params.page >= maxPage || !loaded) {
      return;
    }

    setParams(prev => ({
      ...prev,
      perPage: prev.perPage + 20,
    }));
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
        data={data?.data}
        renderItem={renderItem}
        // skeletonType="survey"
        refreshing={!loaded && params.perPage === -1}
        emptyLabel="No hay datos"
        onRefresh={handleReload}
        loading={!loaded && params.perPage > -1}
        onPagination={onPagination}
        total={data?.message?.total || 0}
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
