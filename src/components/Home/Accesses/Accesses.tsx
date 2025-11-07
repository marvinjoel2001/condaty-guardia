import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import ItemList from '../../../../mk/components/ui/ItemList/ItemList';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {
  IconDelivery,
  IconEmpty,
  IconOther,
  IconSearch,
  IconTaxi,
} from '../../../icons/IconLibrary';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import DetAccesses from './DetAccesses';
import {buttonSecondary} from './shares/styles';
import DetOrders from '../Orders/DetOrders';
import Skeleton from '../../../../mk/components/ui/Skeleton/Skeleton';
import DataSearch from '../../../../mk/components/ui/DataSearch';
import ListFlat from '../../../../mk/components/ui/List/ListFlat';

interface PropsType {
  data: any;
  reload: any;
  typeSearch: string;
  isLoading: boolean;
}
const statusText: any = {
  E: 'Esperando aprobación',
  A: 'Dejar ingresar',
  N: 'Rechazado',
  S: 'Dejar salir',
};
const statusColor: any = {
  E: {color: cssVar.cWarning, background: cssVar.cHoverWarning},
  A: {color: cssVar.cSuccess, background: cssVar.cHoverSuccess},
  N: {color: cssVar.cError, background: cssVar.cHoverError},
  S: {color: cssVar.cAlertMedio, background: cssVar.cHoverOrange},
};

const NoResults = ({text, icon}: any) => (
  <View style={styles.noResultsContainer}>
    <Icon name={icon} color={cssVar.cWhiteV1} size={60} />
    <Text style={styles.noResultsText}>{text}</Text>
  </View>
);

const subtitleAccess = (item: any) => {
  let prefix = 'Visitó a: ';
  if (item.type === 'P' && item.other?.otherType?.name === 'Taxi') {
    prefix = 'Recogió a: ';
  }
  if (item.type === 'P' && item.other?.otherType?.name === 'Mensajería') {
    prefix = 'Entregó a: ';
  }
  if (item.type === 'P' && item.other?.otherType?.name === 'Delivery') {
    prefix = 'Entregó a: ';
  }
  if (item.type === 'P' && item.other?.otherType?.name === 'Otro') {
    prefix = 'Para: ';
  }
  if (item?.confirm === 'N' && item?.obs_confirm) {
    prefix = 'Denegado por: ';
  }
  if (!item?.in_at) {
    prefix = 'Visita a: ';
  }
  return <Text>{prefix + getFullName(item.owner)}</Text>;
};
const titleAccess = (item: any) => {
  return <Text>{getFullName(item?.visit || item?.owner)}</Text>;
};

const Accesses = ({data, reload, typeSearch, isLoading}: PropsType) => {
  const [openDetail, setOpenDetail] = useState(false);
  const [formState, setFormState]: any = useState({});
  const [openDetailOrders, setOpenDetailOrders] = useState(false);
  const [search, setSearch] = useState('');

  const {dataAccesses, dataOrders} = useMemo(() => {    
    if (!data) return {dataAccesses: null, dataOrders: null};

    const filterByType = (items: any[], type: string) => {
      if (type === 'I') {
        return items?.filter(item => {
          if (item?.other_type && item?.access?.in_at) {
            return null;
          }
          return !item?.in_at && !item?.out_at;
        });
      } else if (type === 'S') {
        return items?.filter(item => item?.in_at);
      }
      return [];
    };

    const result = {
      dataAccesses: filterByType(data?.accesses, typeSearch),
      dataOrders: filterByType(data?.others, typeSearch),
    };

    return result;
  }, [data, typeSearch]);

  useEffect(() => {
    setSearch('');
  }, [typeSearch]);

  const onPressDetail = (item: any, type: string) => {
    if (type == 'A') setOpenDetail(true);
    if (type == 'O') setOpenDetailOrders(true);
    setFormState({id: item.id});
  };

  const getStatus = (item: any) => {
    if (!item?.in_at && !item?.confirm_at) {
      return 'E';
    }
    if (!item?.in_at && item?.confirm_at) {
      if (item?.confirm === 'Y') {
        return 'A';
      } else if (item?.confirm === 'N') {
        return 'N';
      }
    }
    if (item?.in_at && !item?.out_at) {
      return 'S';
    }
    return '';
  };

  const rightAccess = (item: any) => {
    return (
      <Text
        style={{
          fontSize: 10,
          color: statusColor[getStatus(item)]?.color,
          backgroundColor: statusColor[getStatus(item)]?.background,
          padding: 4,
          borderRadius: 4,
          fontFamily: FONTS.regular,
        }}>
        {statusText[getStatus(item)]}
      </Text>
    );
  };
  const right = (item: any) => {
    // Si el pedido está cancelado, mostramos un texto de "Cancelado"
    if (item.status === 'X') {
      return (
        <Text
          style={{
            color: cssVar.cError,
            fontSize: 12,
            fontFamily: FONTS.regular,
          }}>
          Cancelado
        </Text>
      );
    }
    if (item.access && !item.access.out_at) {
      return (
        <TouchableOpacity
          style={{borderRadius: 10}}
          onPress={() => onPressDetail(item, 'O')}>
          <Text style={buttonSecondary}>Dejar salir</Text>
        </TouchableOpacity>
      );
    }

    if (!item.access) {
      return (
        <TouchableOpacity
          style={{borderRadius: 10}}
          onPress={() => onPressDetail(item, 'O')}>
          <Text
            style={{
              color: cssVar.cWarning,
              backgroundColor: 'rgba(225, 193, 81, 0.2)',
              borderRadius: 4,
              padding: 4,
              fontSize: 10,
              fontFamily: FONTS.regular,
            }}>
            Registrar ingreso
          </Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const iconAccess = (item: any) => {
    if (item.type === 'P') {
      const icon =
        item?.other?.other_type_id == 1
          ? IconDelivery
          : item?.other?.other_type_id == 2
          ? IconTaxi
          : IconOther;
      return (
        <Icon
          style={{
            backgroundColor: cssVar.cWhiteV1,
            padding: 8,
            borderRadius: 50,
          }}
          name={icon}
          color={cssVar.cPrimary}
          size={24}
        />
      );
    }
    if (item?.taxi == 'C') {
      return (
        <Icon
          style={{
            backgroundColor: cssVar.cWhiteV1,
            padding: 8,
            borderRadius: 50,
          }}
          name={IconTaxi}
          color={cssVar.cPrimary}
          size={24}
        />
      );
    }
    
    // Quitando el avatar temporalmente por problemas de performance 07/11/2025
    // const avatarSrc = getUrlImages(
    //   item.visit
    //     ? `/VISIT-${item.visit?.id}.png?d=${item.updated_at}`
    //     : `/OWNER-${item.owner_id}.webp?d=${item.updated_at}`,
    // );

    return (
      <Avatar
        hasImage={0}  
        // Quitando el avatar temporalmente por problemas de performance 07/11/2025
        //hasImage={item?.visit?.has_image || item?.owner?.has_image}
        //src={avatarSrc}
        name={getFullName(item.visit) || getFullName(item.owner)}
      />
    );
  };
  const iconOrder = (item: any) => {
    const icon =
      item?.other_type?.id == 1
        ? IconDelivery
        : item?.other_type?.id == 2
        ? IconTaxi
        : IconOther;
    return (
      <Icon
        style={{
          backgroundColor: cssVar.cWhiteV1,
          padding: 10,
          borderRadius: 100,
        }}
        name={icon}
        size={24}
      />
    );
  };

  const removeAccents = (str: string) => {
    return str
      ?.normalize('NFD')
      ?.replace(/[\u0300-\u036f]/g, '')
      ?.toLowerCase();
  };

  const renderItemAccess = (item: any) => {
    const status = getStatus(item);
    const hasColoredBorder = status === 'N' || status === 'A';

    return (
      <ItemList
        key={item.id}
        title={titleAccess(item)}
        subtitle={subtitleAccess(item)}
        left={iconAccess(item)}
        right={rightAccess(item)}
        widthMain={150}
        onPress={() => onPressDetail(item, 'A')}
        style={{
          borderWidth: hasColoredBorder ? 0.5 : 0,
          borderColor: hasColoredBorder
            ? statusColor[status]?.color
            : 'transparent',
        }}
      />
    );
  };

  const renderItemOrder = (item: any) => {
    return (
      <ItemList
        key={item?.id}
        onPress={() => onPressDetail(item, 'O')}
        title={'Pedido/' + item?.other_type?.name}
        subtitle={
          !item?.access?.in_at
            ? 'Para: ' + getFullName(item?.owner)
            : 'Entregó a: ' + getFullName(item?.owner)
        }
        left={iconOrder(item)}
        right={right(item)}
      />
    );
  };

  const filterBySearch = (items: any[], searchTerm: string) => {
    if (!searchTerm) return items;

    return items?.filter(item => {
      const visitName = item?.visit ? getFullName(item.visit) : '';
      const ownerName = item?.owner ? getFullName(item.owner) : '';
      const visitCI = item?.visit?.ci || '';
      const otherTypeName = item?.other_type?.name || '';

      return (
        removeAccents(visitName)?.includes(removeAccents(searchTerm)) ||
        removeAccents(ownerName)?.includes(removeAccents(searchTerm)) ||
        removeAccents(otherTypeName)?.includes(removeAccents(searchTerm)) ||
        removeAccents(visitCI)?.includes(removeAccents(searchTerm)) ||
        removeAccents(item?.plate)?.includes(removeAccents(searchTerm))
      );
    });
  };

  const filteredAccesses = useMemo(() => {
    const result = filterBySearch(dataAccesses || [], search);
    return result;
  }, [dataAccesses, search]);

  const filteredOrders = useMemo(() => {
    const result = filterBySearch(dataOrders || [], search);
    return result;
  }, [dataOrders, search]);

  // Combinar ambos arreglos en uno solo para ListFlat
  const combinedData = useMemo(() => {    
    const accesses = (filteredAccesses || []).map((item: any) => ({
      ...item,
      itemType: 'access',
    }));
    const orders = (filteredOrders || []).map((item: any) => ({
      ...item,
      itemType: 'order',
    }));
    const result = [...accesses, ...orders];
        
    return result;
  }, [filteredAccesses, filteredOrders]);

  // Función de renderizado para ListFlat
  const renderCombinedItem = useCallback(
    (item: any) => {
      let result;
      
      if (item.itemType === 'access') {
        result = renderItemAccess(item);
      } else {
        result = renderItemOrder(item);
      }
      
      
      return result;
    },
    [],
  );

  return (
    <>
      {isLoading && !dataAccesses && !dataOrders ? (
        <Skeleton type="list" />
      ) : (
        <>
          <DataSearch
            setSearch={setSearch}
            name="home"
            value={search}
            style={{marginBottom: 8}}
          />

          {(() => {
            const list = (
              <ListFlat
                data={combinedData}
                renderItem={renderCombinedItem}
                style={{paddingBottom: 150}}
                keyExtractor={(item: any) => `${item.itemType}-${item.id}`}
                onRefresh={reload}
                refreshing={isLoading}
                emptyLabel={
                  <NoResults
                    icon={search ? IconSearch : IconEmpty}
                    text={
                      search
                        ? 'No se encontraron coincidencias. Ajusta tus filtros o prueba en una búsqueda diferente'
                        : 'No hay datos'
                    }
                  />
                }
              />
            );
            
            return list;
          })()}
        </>
      )}

      {openDetail && (
        <DetAccesses
          id={formState?.id}
          open={openDetail}
          close={() => setOpenDetail(false)}
          reload={reload}
        />
      )}
      {openDetailOrders && (
        <DetOrders
          id={formState?.id}
          open={openDetailOrders}
          close={() => setOpenDetailOrders(false)}
          reload={reload}
        />
      )}
    </>
  );
};
export default React.memo(Accesses);

const styles = StyleSheet.create({
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 80,
  },
  noResultsText: {
    marginTop: 8,
    fontSize: 14,
    color: cssVar.cWhiteV1,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
});
