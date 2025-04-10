import React, {useState} from 'react';
import List from '../../../../mk/components/ui/List/List';
import {View} from 'react-native';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import {getFullName} from '../../../../mk/utils/strings';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconDelivery, IconOther, IconTaxi} from '../../../icons/IconLibrary';
import {cssVar} from '../../../../mk/styles/themes';
import OrdersDetail from './OrdersDetail';
import useApi from '../../../../mk/hooks/useApi';
type Props = {
  data: any;
  loaded: boolean;
};

export const Orders = ({data, loaded}: Props) => {
  const [openDetail, setOpenDetail] = useState({open: false, id: null});
  const left = (item: any) => {
    let icon = IconOther;
    if (item?.other_type_id == 1) icon = IconDelivery;
    if (item?.other_type_id == 2) icon = IconTaxi;
    return (
      <View
        style={{
          padding: 8,
          borderRadius: '100%',
          backgroundColor: cssVar.cWhite,
        }}>
        <Icon name={icon} />
      </View>
    );
  };
  const renderItem = (item: any) => {
    return (
      <ItemList
        onPress={() => setOpenDetail({open: true, id: item.id})}
        title={getFullName(item?.owner)}
        subtitle={'Entregado por ' + getFullName(item?.access?.visit)}
        left={left(item)}
      />
    );
  };
  return (
    <View style={{paddingHorizontal: 16}}>
      <List data={data} renderItem={renderItem} refreshing={loaded} />
      {openDetail.open && (
        <OrdersDetail
          open={openDetail.open}
          onClose={() => setOpenDetail({open: false, id: null})}
          id={openDetail.id}
        />
      )}
    </View>
  );
};
