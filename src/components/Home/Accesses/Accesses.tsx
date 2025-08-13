import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {
  IconDelivery,
  IconEmpty,
  IconOther,
  IconSearch,
  IconSearchDefault,
  IconTaxi,
} from '../../../icons/IconLibrary';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import DetAccesses from './DetAccesses';
import {buttonSecondary} from './shares/styles';
import DetOrders from '../Orders/DetOrders';
import Skeleton from '../../../../mk/components/ui/Skeleton/Skeleton';
import DataSearch from '../../../../mk/components/ui/DataSearch';
import {View} from 'react-native';
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
  E: {color: cssVar.cSuccess, background: cssVar.cHoverSuccess},
  A: {color: cssVar.cSuccess, background: cssVar.cHoverSuccess},
  N: {color: cssVar.cError, background: cssVar.cHoverError},
  S: {color: cssVar.cAlertMedio, background: cssVar.cHoverOrange},
};
const Accesses = ({data, reload, typeSearch, isLoading}: PropsType) => {
  const [openDetail, setOpenDetail] = useState(false);
  const [formState, setFormState]: any = useState({});
  const [dataAccesses, setDataAccesses] = useState([]);
  const [dataOrders, setDataOrders] = useState([]);
  const [openDetailOrders, setOpenDetailOrders] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let _dataAccesses = [];
    let _dataOrders = [];
    if (typeSearch === 'I') {
      _dataAccesses = data?.accesses?.filter(
        (item: any) => !item?.in_at && !item?.out_at,
      );
      _dataOrders = data?.others?.filter(
        (item: any) => !item?.access?.in_at && !item?.access?.out_at,
      );
    } else if (typeSearch === 'S') {
      _dataAccesses = data?.accesses?.filter((item: any) => item?.in_at);
      _dataOrders = data?.others?.filter((item: any) => item?.access?.in_at);
    }
    setDataAccesses(_dataAccesses || []);
    setDataOrders(_dataOrders || []);
  }, [typeSearch, data]);

  const filteredAccesses = useMemo(() => {
    if (!search) return dataAccesses; // Devuelve todo si la búsqueda está vacía
    const lowercasedSearch = search.toLowerCase();

    return dataAccesses.filter((item: any) => {
      const visitName = getFullName(item.visit).toLowerCase();
      return visitName.includes(lowercasedSearch);
    });
  }, [search, dataAccesses]);

  const filteredOrders = useMemo(() => {
    if (!search) return dataOrders; // Devuelve todo si la búsqueda está vacía
    const lowercasedSearch = search.toLowerCase();

    return dataOrders.filter((item: any) => {
      const ownerName = getFullName(item.owner).toLowerCase();
      const orderType = item?.other_type?.name?.toLowerCase() || '';
      return (
        ownerName.includes(lowercasedSearch) ||
        orderType.includes(lowercasedSearch)
      );
    });
  }, [search, dataOrders]);

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
    if (item?.type !== 'O' && item?.in_at && !item?.out_at) {
      return 'S';
    }
    return '';
  };

  const rightAccess = (item: any) => {
    return (
      <Text
        style={{
          fontSize: 10,
          color: statusColor[getStatus(item)].color,
          backgroundColor: statusColor[getStatus(item)].background,
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

  const titleAccess = (item: any) => {
    return item.type === 'O' ? (
      <Text>{getFullName(item.owner)}</Text>
    ) : (
      <Text>{getFullName(item.visit)}</Text>
    );
  };

  const subtitleAccess = (item: any) => {
    if (item.type === 'O') {
      return 'USO LLAVE VIRTUAL QR';
    }
    let prefix = 'Visitó a: ';
    if (item.type === 'P' && item.other?.otherType?.name === 'Taxi') {
      prefix = 'Recogió a: ';
    }
    if (item.type === 'P' && item.other?.otherType?.name === 'Mensajeria') {
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

  const iconAccess = (item: any) => {
    const isOrder = item.type === 'P';
    const orderIcons: Record<string, any> = {
      Taxi: IconTaxi,
      Mensajeria: IconOther,
      Delivery: IconDelivery,
      Otro: IconOther,
    };

    if (isOrder) {
      const iconName = orderIcons[item.other?.otherType?.name] || IconOther;
      return (
        <Icon
          style={{
            backgroundColor: cssVar.cWhite,
            padding: 8,
            borderRadius: 50,
          }}
          name={iconName}
          size={24}
        />
      );
    }

    const avatarSrc = getUrlImages(
      item.type === 'O'
        ? `/OWNER-${item.owner_id}.webp?d=${item.updated_at}`
        : `/VISIT-${item.visit?.id}.png?d=${item.updated_at}`,
    );

    return (
      <Avatar
        src={avatarSrc}
        name={
          item.type === 'O' ? getFullName(item.owner) : getFullName(item.visit)
        }
      />
    );
  };
  const iconOrder = (item: any) => {
    const orderIcons: Record<string, any> = {
      Taxi: IconTaxi,
      Mensajeria: IconOther,
      Delivery: IconDelivery,
      Otro: IconOther,
    };

    const iconName = orderIcons[item?.other_type?.name] || IconOther;
    return (
      <Icon
        style={{
          backgroundColor: cssVar.cWhiteV1,
          padding: 10,
          borderRadius: 100,
        }}
        name={iconName}
        size={24}
      />
    );
  };

  const renderItemAccess = (item: any) => {
    return (
      <ItemList
        key={item.id}
        title={titleAccess(item)}
        subtitle={subtitleAccess(item)}
        left={iconAccess(item)}
        right={rightAccess(item)}
        widthMain={150}
        onPress={() => onPressDetail(item, 'A')}
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
  const NoResults = ({text, icon}: any) => (
    <View style={styles.noResultsContainer}>
      <Icon name={icon} color={cssVar.cWhiteV1} size={60} />
      <Text style={styles.noResultsText}>{text}</Text>
    </View>
  );
  return (
    <>
      {isLoading && <Skeleton type="list" />}
      {!isLoading && (
        <>
          <DataSearch
            setSearch={setSearch}
            name="home"
            value={search}
            style={{marginBottom: 8}}
          />
          {(filteredAccesses.length > 0 || filteredOrders.length > 0) && (
            <>
              {filteredAccesses.map((item: any) => renderItemAccess(item))}
              {filteredOrders.map((item: any) => renderItemOrder(item))}
            </>
          )}

          {filteredAccesses.length === 0 && filteredOrders.length === 0 && (
            <NoResults
              icon={search ? IconSearch : IconEmpty}
              text={
                search
                  ? 'No se encontraron coincidencias. Ajusta tus filtros o prueba en una búsqueda diferente'
                  : 'No hay datos'
              }
            />
          )}
        </>
      )}

      {openDetail && (
        <DetAccesses
          id={formState?.id}
          open={openDetail}
          close={() => setOpenDetail(false)}
          reload={reload}
          // execute={execute}
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
export default Accesses;
