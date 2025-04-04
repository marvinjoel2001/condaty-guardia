// Pedidos.tsx
import React, {useEffect, useState, useContext} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import {getFullName} from '../../../../mk/utils/strings';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import List from '../../../../mk/components/ui/List/List';
import DetOrders from './DetOrders';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import ItemListDate from '../Accesses/shares/ItemListDate';
import {IconDelivery, IconOther, IconTaxi} from '../../../icons/IconLibrary';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {buttonPrimary, buttonSecondary} from '../Accesses/shares/styles';

const Orders = ({data, reload, setDataID}: any) => {
  const [openDetail, setOpenDetail] = useState(false);
  const [formState, setFormState]: any = useState({});

  //   useEffect(() => {
  //     // Si usas setDataID para alguna navegación o estado externo
  //     setDataID(62);
  //   }, [openDetail]);
  const icon = (item: any) => {
    const orderIcons: Record<string, any> = {
      Taxi: IconTaxi,
      Mensajeria: IconOther,
      Delivery: IconDelivery,
      Otro: IconOther,
    };
    // console.log(item?.other_type?.name,'icono')

    const iconName = orderIcons[item?.other_type?.name] || IconOther;
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
  };

  const onPressDetail = (item: any) => {
    setOpenDetail(true);
    setFormState({id: item.id});
  };

  const hours = (item: any) => {
    return (
      <ItemListDate
        inDate={item?.access?.in_at}
        outDate={item?.access?.out_at}
      />
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
          onPress={() => onPressDetail(item)}>
          <Text style={buttonSecondary}>Dejar salir</Text>
        </TouchableOpacity>
      );
    }

    if (!item.access) {
      return (
        <TouchableOpacity
          style={{borderRadius: 10}}
          onPress={() => onPressDetail(item)}>
          <Text style={buttonPrimary}>Dejar Entrar</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderItemOrder = (item: any) => {
    // console.log(item , 'item pedidos pipipi')
    return (
      <TouchableOpacity onPress={() => onPressDetail(item)}>
        <ItemList
          title={getFullName(
            item?.access?.in_at ? item?.access?.visit : item?.owner,
          )}
          subtitle={
            !item?.access?.in_at
              ? 'Detalle: ' + item?.descrip
              : 'Entregó a: ' + getFullName(item?.owner)
          }
          left={icon(item)}
          right={right(item)}
          date={hours(item)}
          // Aquí puedes agregar un botón o indicador si requieres mostrar “Dejar entrar” o “Dejar salir”
        />
      </TouchableOpacity>
    );
  };

  return (
    <>
      {data?.length === 0 ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>Aquí se verá tu lista</Text>
        </View>
      ) : (
        <List data={data} renderItem={renderItemOrder} />
      )}

      {openDetail && (
        <DetOrders
          id={formState?.id}
          open={openDetail}
          close={() => setOpenDetail(false)}
          reload={reload}
        />
      )}
    </>
  );
};

export default Orders;
