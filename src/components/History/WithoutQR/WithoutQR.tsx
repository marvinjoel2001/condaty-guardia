import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import ListFlat from '../../../../mk/components/ui/List/ListFlat';
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import AccessDetail from '../Accesses/AccessDetail';
import DateAccess from '../DateAccess/DateAccess';
import useApi from '../../../../mk/hooks/useApi';
import DataSearch from '../../../../mk/components/ui/DataSearch';

const paramsInitial = {
  perPage: 10,
  page: 1,
  fullType: 'WQ',
  section: 'ACT',
};
const WithoutQR = () => {
  const [search, setSearch] = useState('');
  const [openDetail, setOpenDetail] = useState({open: false, id: null});
  const [params, setParams] = useState(paramsInitial);
  const {data, reload, loaded} = useApi('/accesses', 'GET', params, 3);
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
    let user = item?.visit ? item?.visit : item?.owner;
    const subTitle =
      item.type == 'O'
        ? 'Llave QR'
        : item.type == 'C'
        ? 'Sin QR'
        : item.type == 'I'
        ? 'QR Individual'
        : item.type == 'G'
        ? 'QR Grupal'
        : item.type == 'F'
        ? 'QR Frecuente'
        : item.type == 'P'
        ? 'Pedido'
        : '';

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
            hasImage={user?.has_image}
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
    <View style={{flex: 1}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}>
        <DataSearch
          setSearch={(value: string) => onSearch(value)}
          name="without-qr"
          value={search}
          style={{flex: 1}}
        />
      </View>

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

export default WithoutQR;
