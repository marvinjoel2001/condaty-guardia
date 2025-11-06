import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import List from '../../../../mk/components/ui/List/List';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import AccessDetail from './AccessDetail';
import DateAccess from '../DateAccess/DateAccess';
import DataSearch from '../../../../mk/components/ui/DataSearch';
import useApi from '../../../../mk/hooks/useApi';
import ListFlat from '../../../../mk/components/ui/List/ListFlat';


const paramsInitial = {
  perPage: 10,
  page: 1,
  fullType: 'L',
  section: 'ACT',
};
const Accesses = () => {
  const [search, setSearch] = useState('');
  const [openDetail, setOpenDetail] = useState({open: false, id: null});
  const {execute} = useApi();
  // const [data, setData]: any = useState([]);
  const[params,setParams]=useState(paramsInitial);
  // const [loaded, setLoaded] = useState(false);

  const removeAccents = (str: string) => {
    return str
      ?.normalize('NFD')
      ?.replace(/[\u0300-\u036f]/g, '')
      ?.toLowerCase();
  };
  const {data, reload, loaded} =  useApi(
        "/accesses",
        'GET',
        {
          ...params,
        },
        3,
      );
  
  useEffect(() => {
    reload(params);
  }, [params]);
  const getAccessSubtitle = (item: any): string => {
    const groupTitle = item.invitation?.title || item.access?.invitation?.title;

    switch (item.type) {
      case 'O':
        return 'Llave QR';
      case 'C':
        return 'Sin QR';
      case 'I':
        return 'QR Individual';
      case 'G':
        return 'QR Grupal' + (groupTitle ? ' - ' + groupTitle : '');
      case 'F':
        return 'QR Frecuente';
      case 'P':
        return 'Pedido';
      default:
        return '';
    }
  };
  const renderItem = (item: any) => {
    let user = item?.visit ? item?.visit : item?.owner;

    if (search && search !== '') {
      if (
        removeAccents(getFullName(user))?.includes(removeAccents(search)) ===
        false
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
        subtitle={getAccessSubtitle(item)}
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
          name="accesses"
          value={search}
          style={{flex: 1}}
        />
      </View>
      {/* <List
        data={data}
        renderItem={renderItem}
        refreshing={loaded}
        skeletonType="access"
      /> */}
      {/* <ListFlat
        data={data}
        renderItem={renderItem}
        refreshing={loaded}
        skeletonType="access"
      /> */}
       <ListFlat
          data={data?.data}
          renderItem={renderItem}
          // skeletonType="survey"
          refreshing={!loaded && params.perPage === -1}
          emptyLabel="No hay datos en la bitácora"
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

export default Accesses;
