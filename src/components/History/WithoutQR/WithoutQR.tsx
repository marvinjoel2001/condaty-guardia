import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getFullName, getUrlImages } from '../../../../mk/utils/strings';
import ListFlat from '../../../../mk/components/ui/List/ListFlat';
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import AccessDetail from '../Accesses/AccessDetail';
import DateAccess from '../DateAccess/DateAccess';
import useApi from '../../../../mk/hooks/useApi';
import DataSearch from '../../../../mk/components/ui/DataSearch';

const WithoutQR = () => {
  const paramsInitial = {
    perPage: 30,
    page: 1,
    fullType: 'WQ',
    section: 'ACT',
    searchBy: '',
  };
  const [search, setSearch] = useState('');
  const [openDetail, setOpenDetail] = useState({ open: false, id: null });
  const [params, setParams] = useState(paramsInitial);
  const [accumulatedData, setAccumulatedData] = useState<any[]>([]);
  const { data, reload, loaded } = useApi('/accesses', 'GET', params);
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
  //     ?.toLowerCase();`
  // };

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
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <DataSearch
          setSearch={(value: string) => onSearch(value)}
          name="without-qr"
          value={search}
          style={{ flex: 1 }}
        />
      </View>

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
      {openDetail?.open && (
        <AccessDetail
          open={openDetail?.open}
          onClose={() => setOpenDetail({ open: false, id: null })}
          id={openDetail?.id}
        />
      )}
    </View>
  );
};

export default WithoutQR;
