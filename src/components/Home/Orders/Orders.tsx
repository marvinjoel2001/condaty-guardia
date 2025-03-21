// Orders.tsx
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import List from '../../../../mk/components/ui/List/List';
import { ItemList } from '../../../../mk/components/ui/ItemList/ItemList';

import { getFullName, getUrlImages } from '../../../../mk/utils/strings';
import { cssVar, FONTS } from '../../../../mk/styles/themes';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import { IconDelivery, IconOther, IconTaxi } from '../../../icons/IconLibrary';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import ItemListDate from '../Accesses/shares/ItemListDate';



const Orders = ({ data, reload, setDataID }: any) => {
  const [openDetail, setOpenDetail] = useState(false);
  const [edit, setEdit] = useState(false);
  const [formState, setFormState]: any = useState({});
  const screenParams: any = useState(null);

  useEffect(() => {
    setDataID(62);
  }, [openDetail]);

  const onPressDetail = (item: any) => {
    setOpenDetail(true);
    setFormState({ id: item.id });
  };

  // Funciones para armar la información de cada pedido
  const title = (item: any) => {
    // En pedidos se muestra el nombre del cliente
    return <Text>{getFullName(item.client)}</Text>;
  };

  const subtitle = (item: any) => {
    // Ejemplo: "Pedido para: Nombre del cliente"
    return <Text>{`Pedido para: ${getFullName(item.client)}`}</Text>;
  };

  const hours = (item: any) => {
    // Suponiendo que el pedido tiene una fecha en la propiedad "date"
    return (
      <ItemListDate
        inDate={item.date}
        outDate={null}
      />
    );
  };

  const icon = (item: any) => {
    // Se utiliza un diccionario de iconos para pedidos según el tipo
    const orderIcons: Record<string, any> = {
      Taxi: IconTaxi,
      Mensajeria: IconOther,
      Delivery: IconDelivery,
      Otro: IconOther,
    };

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
  };

  const renderItemOrder = (item: any, onPressDetail: (item: any) => void) => {
    console.log(item,'iteemmm')
    return (
      <ItemList
        title={title(item)}
        subtitle={subtitle(item)}
        left={icon(item)}
    
        right={null}
        date={hours(item)}
        widthMain={150}
        onPress={() => onPressDetail(item)}
      />
    );
  };

  return (
    <>
      <List data={data} renderItem={(item) => renderItemOrder(item, onPressDetail)} />
 
    </>
  );
};

export default Orders;
