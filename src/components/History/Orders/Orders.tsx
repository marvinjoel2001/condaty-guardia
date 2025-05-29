import React, {useState} from 'react';
import List from '../../../../mk/components/ui/List/List';
import {View} from 'react-native';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {
  IconDelivery,
  IconDownload,
  IconOther,
  IconTaxi,
} from '../../../icons/IconLibrary';
import {cssVar} from '../../../../mk/styles/themes';
import OrdersDetail from './OrdersDetail';
import useApi from '../../../../mk/hooks/useApi';
import DataSearch from '../../../../mk/components/ui/DataSearch';
import {openLink} from '../../../../mk/utils/utils';
type Props = {
  data: any;
  loaded: boolean;
};

export const Orders = ({data, loaded}: Props) => {
  const [openDetail, setOpenDetail] = useState({open: false, id: null});
  const [search, setSearch] = useState('');
  const {execute} = useApi();

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
    if (search && search !== '') {
      if (
        !getFullName(item?.owner).toLowerCase().includes(search.toLowerCase())
      ) {
        return null;
      }
    }
    return (
      <ItemList
        onPress={() => setOpenDetail({open: true, id: item.id})}
        title={getFullName(item?.owner)}
        subtitle={'Entregado por ' + getFullName(item?.access?.visit)}
        left={left(item)}
      />
    );
  };
  const onSearch = (value: string) => {
    setSearch(value);
  };

  const onExport = async () => {
    const {data: file} = await execute('/others', 'GET', {
      perPage: -1,
      page: 1,
      fullType: 'L',
      section: 'ACT',
      _export: 'pdf',
    });
    if (file?.success == true) {
      openLink(getUrlImages('/' + file?.data.path));
    }
  };

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}>
        <DataSearch
          setSearch={(value: string) => onSearch(value)}
          name="orders"
          value={search}
          style={{flex: 1}}
        />
        {/* <Icon
          name={IconDownload}
          onPress={onExport}
          fillStroke={cssVar.cWhiteV2}
          color={'transparent'}
        /> */}
      </View>
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
