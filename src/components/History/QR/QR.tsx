import React, {useState} from 'react';
import {View} from 'react-native';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import List from '../../../../mk/components/ui/List/List';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import AccessDetail from '../Accesses/AccessDetail';
import DateAccess from '../DateAccess/DateAccess';
import useApi from '../../../../mk/hooks/useApi';
import DataSearch from '../../../../mk/components/ui/DataSearch';
import {openLink} from '../../../../mk/utils/utils';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconDownload} from '../../../icons/IconLibrary';
import {cssVar} from '../../../../mk/styles/themes';

type Props = {
  data: any;
  loaded: boolean;
};

const QR = ({data, loaded}: Props) => {
  const {execute} = useApi();
  const [search, setSearch] = useState('');
  const [openDetail, setOpenDetail] = useState({open: false, id: null});

  const renderItem = (item: any) => {
    let user = item?.visit ? item?.visit : item?.owner;
    const subTitle =
      item.type == 'O' ? 'Llave QR' :
      item.type == 'C' ? 'Sin QR' : 
      item.type == 'I' ? 'QR Individual' : 
      item.type == 'G' ? 'QR Grupal' : 
      item.type == 'F' ? 'QR Frecuente' : 
      item.type == 'P' ? 'Pedido'  : '';

    if (search && search !== '') {
      if (
        user.name?.toLowerCase()?.includes(search?.toLowerCase()) === false &&
        user?.last_name?.toLowerCase()?.includes(search?.toLowerCase()) === false
      ) {
        return null;
      }
    }
    return (
      <ItemList
        onPress={() => {
          setOpenDetail({
            open: true,
            id: item?.access_id ? item?.access_id : item.id,
          });
        }}
        key={item?.id}
        title={getFullName(user)}
        subtitle={subTitle}
        left={
          <Avatar
            name={getFullName(user)}
            src={
              !item?.visit
                ? getUrlImages(
                    '/OWNER-' + user?.id + '.webp?d=' + user?.updated_at,
                  )
                : ''
            }
          />
        }
        right={<DateAccess access={item} />}
      />
    );
  };

  const onSearch = (value: string) => {
    setSearch(value);
  };

  const onExport = async () => {
    const {data: file} = await execute('/accesses', 'GET', {
      perPage: -1,
      page: 1,
      fullType: 'Q',
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
          name="qr"
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
      <List
        data={data}
        renderItem={renderItem}
        refreshing={loaded}
        skeletonType="access"
      />
      {openDetail?.open && (
        <AccessDetail
          open={openDetail?.open}
          onClose={() => setOpenDetail({open: false, id: null})}
          id={openDetail?.id}
        />
      )}
    </View>
  );
};

export default QR; 