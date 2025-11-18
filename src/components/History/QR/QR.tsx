import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import AccessDetail from '../Accesses/AccessDetail';
import DateAccess from '../DateAccess/DateAccess';
import useApi from '../../../../mk/hooks/useApi';
import DataSearch from '../../../../mk/components/ui/DataSearch';
import ListFlat from '../../../../mk/components/ui/List/ListFlat';

const paramsInitial = {
  perPage: 30,
  page: 1,
  fullType: 'Q',
  section: 'ACT',
  searchBy: '',
};

const QR = () => {
  const [search, setSearch] = useState('');
  const [openDetail, setOpenDetail] = useState({open: false, id: null});
  const [params, setParams] = useState(paramsInitial);
  const [accumulatedData, setAccumulatedData] = useState<any[]>([]);
  const {data, reload, loaded} = useApi('/accesses', 'GET', params);
  useEffect(() => {
    reload(params, 2);
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
    const groupTitle = item.invitation?.title || item.access?.invitation?.title;
    const subTitle =
      item.type == 'O'
        ? 'Llave QR'
        : item.type == 'C'
        ? 'Sin QR'
        : item.type == 'I'
        ? 'QR Individual'
        : item.type == 'G'
        ? 'QR Grupal' + (groupTitle ? ' - ' + groupTitle : '')
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
  const onPagination = () => {
    if (!loaded) {
      return;
    }

    if (data?.message?.total == -1 && data?.data?.length < params.perPage) {
      return;
    }

    setParams(prev => ({
      ...prev,
      page: prev.page + 1,
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
          name="qr"
          value={search}
          style={{flex: 1}}
        />
      </View>

      <ListFlat
        data={accumulatedData}
        renderItem={renderItem}
        refreshing={params.page === 1 && !loaded}
        emptyLabel="No hay datos"
        onRefresh={handleReload}
        loading={!loaded}
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

export default QR;
