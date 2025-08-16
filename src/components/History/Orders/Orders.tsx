import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import List from '../../../../mk/components/ui/List/List';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import OrdersDetail from './OrdersDetail';
import DataSearch from '../../../../mk/components/ui/DataSearch';
import DateAccess from '../DateAccess/DateAccess';

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

type Props = {
  data: any[];
  loaded: boolean;
};

export const Orders = ({data, loaded}: Props) => {
  const [openDetail, setOpenDetail] = useState({
    open: false,
    id: null as number | string | null,
  });
  const [search, setSearch] = useState('');

  const renderItem = (item: any) => {
    if (search && search !== '') {
      if (
        !getFullName(item?.owner).toLowerCase().includes(search.toLowerCase())
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

  return (
    <View style={styles.pageContainer}>
      <DataSearch
        setSearch={onSearch}
        name="orders"
        value={search}
        style={{marginBottom: 8}}
      />
      <List data={data} renderItem={renderItem} refreshing={loaded} />
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
