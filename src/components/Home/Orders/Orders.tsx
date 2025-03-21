// Pedidos.tsx
import React, { useEffect, useState, useContext } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ItemList } from '../../../../mk/components/ui/ItemList/ItemList';
import { getFullName } from '../../../../mk/utils/strings';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import List from '../../../../mk/components/ui/List/List';
import DetOrders from './DetOrders';


const Orders = ({ data, reload, setDataID }: any) => {

  const [openDetail, setOpenDetail] = useState(false);
  const [formState, setFormState]: any = useState({});

//   useEffect(() => {
//     // Si usas setDataID para alguna navegación o estado externo
//     setDataID(62);
//   }, [openDetail]);

  const onPressDetail = (item: any) => {
    setOpenDetail(true);
    setFormState({ id: item.id });
  };

  const renderItemOrder = (item: any) => {
    console.log(item , 'item pedidos pipipi')
    return (
      <TouchableOpacity onPress={() => onPressDetail(item)}>
        <ItemList
          title={getFullName(item?.access?.visit)}
          subtitle={'Entregó a: ' + getFullName(item?.access?.owner)}
          left={<Avatar name={getFullName(item?.access?.visit)} />}
          // Aquí puedes agregar un botón o indicador si requieres mostrar “Dejar entrar” o “Dejar salir”
        />
      </TouchableOpacity>
    );
  };

  return (
    <>
      {data?.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text >Aquí se verá tu lista</Text>
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
