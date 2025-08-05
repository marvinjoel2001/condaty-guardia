import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import List from '../../../../mk/components/ui/List/List';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import ItemListDate from './shares/ItemListDate';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconDelivery, IconOther, IconTaxi} from '../../../icons/IconLibrary';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import DetAccesses from './DetAccesses';
import {buttonPrimary, buttonSecondary} from './shares/styles';
import DetOrders from '../Orders/DetOrders';
import DetAccessesOld from './DetAccessesOld';
interface PropsType {
  data: any;
  reload: any;
  typeSearch: string;
  loaded: boolean;
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
const Accesses = ({data, reload, typeSearch, loaded}: PropsType) => {
  const [openDetail, setOpenDetail] = useState(false);
  const [formState, setFormState]: any = useState({});
  const [dataAcesses, setDataAccesses] = useState([]);
  const [dataOrders, setDataOrders] = useState([]);
  const [openDetailOrders, setOpenDetailOrders] = useState(false);

  console.log("mi data1",data)
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
    setDataAccesses(_dataAccesses);
    setDataOrders(_dataOrders);
  }, [typeSearch, data]);

  // useEffect(() => {
  //   let _dataAccesses = [];
  //   let _dataOrders = [];

  //   if (typeSearch === 'I') {
  //     _dataAccesses = data?.accesses?.filter(
  //       (item: any) => !item?.in_at && !item?.out_at && getStatus(item) !== 'N'
  //     );

  //     _dataOrders = data?.others?.filter(
  //       (item: any) => !item?.access?.in_at && !item?.access?.out_at && getStatus(item?.access) !== 'N'
  //     );
  //   } else if (typeSearch === 'S') {
  //     _dataAccesses = data?.accesses?.filter(
  //       (item: any) => item?.in_at && getStatus(item) !== 'N'
  //     );

  //     _dataOrders = data?.others?.filter(
  //       (item: any) => item?.access?.in_at && getStatus(item?.access) !== 'N'
  //     );
  //   }

  //   setDataAccesses(_dataAccesses);
  //   setDataOrders(_dataOrders);
  // }, [typeSearch, data]);


  // console.log("mi data2",data)

  const onPressDetail = (item: any, type: string) => {
    if (type == 'A') setOpenDetail(true);
    if (type == 'O') setOpenDetailOrders(true);
    setFormState({id: item.id});
  };

  const handleAction = (item: any) => {
    if (!item?.in_at && item?.confirm_at && item?.confirm === 'Y') {
      onPressDetail(item, 'A');
    } else if (item.in_at && !item.out_at) {
      onPressDetail(item, 'A');
    } else {
      onPressDetail(item, 'A');
    }
  };

  const allowIn = (item: any) => {
    return (
      <TouchableOpacity
        style={{borderRadius: 10}}
        onPress={() => handleAction(item)}
        accessibilityLabel={`Dejar entrar a ${getFullName(item.visit)}`}>
        <Text style={buttonPrimary}>Dejar entrar</Text>
      </TouchableOpacity>
    );
  };

  const allotOut = (item: any) => {
    return (
      <TouchableOpacity
        style={{borderRadius: 10}}
        onPress={() => handleAction(item)}
        accessibilityLabel={`Dejar salir a ${getFullName(item.visit)}`}>
        <Text style={buttonSecondary}>Dejar salir</Text>
      </TouchableOpacity>
    );
  };

  const notAutorized = (item: any) => {
    return (
      <Text
        style={{fontSize: 10, fontFamily: FONTS.regular, color: cssVar.cError}}>
        No Autorizado
      </Text>
    );
  };

  const waitingConfirmation = (item: any) => {
    return (
      <Text
        style={{fontSize: 10, fontFamily: FONTS.regular, color: cssVar.cWhite}}>
        Esperando aprobación
      </Text>
    );
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
    // if (!item?.in_at && !item?.confirm_at) {
    //   return waitingConfirmation(item);
    // }
    // if (!item?.in_at && item?.confirm_at) {
    //   if (item?.confirm === 'Y') {
    //     return allowIn(item);
    //   } else if (item?.confirm === 'N') {
    //     return notAutorized(item);
    //   }
    // }
    // if (item?.type !== 'O' && item?.in_at && !item?.out_at) {
    //   return allotOut(item);
    // }
    // return null;
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
          <Text style={{
              color: cssVar.cWarning,
              backgroundColor: 'rgba(225, 193, 81, 0.2)',
              borderRadius: 4,
              padding: 4,
              fontSize: 10,
              fontFamily: FONTS.regular,
          }}>Registrar ingreso</Text>
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

  // const hoursAccess = (item: any) => {
  //   return (
  //     <ItemListDate
  //       inDate={item.in_at}
  //       outDate={item.type !== 'O' ? item.out_at : null}
  //     />
  //   );
  // };

  // const hours = (item: any) => {
  //   console.log(item, 'item pedidos pipipi');
  //   return (
  //     <ItemListDate
  //       inDate={item?.access?.in_at}
  //       outDate={item?.access?.out_at}
  //     />
  //   );
  // };

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
    // console.log(item?.other_type?.name,'icono')

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
        // date={hoursAccess(item)}
        widthMain={150}
        onPress={() => onPressDetail(item, 'A')}
      />
    );
  };
  const renderItemOrder = (item: any) => {
    // console.log(item , 'item pedidos pipipi')
    return (
      <ItemList
        key={item?.id}
        onPress={() => onPressDetail(item, 'O')}
        title={'Pedido/'+item?.other_type?.name}
        subtitle={
          !item?.access?.in_at
            ? 'Para: ' + getFullName(item?.owner)
            : 'Entregó a: ' + getFullName(item?.owner)
        }
        // truncateSubtitle={true}
        left={iconOrder(item)}
        right={right(item)}
        // date={hours(item)}
      />
    );
  };
  // console.log("dataacces",dataAcesses)
  return (
    <>
      {/* <List
        data={data?.accesses}
        renderItem={item => renderItemAccess(item)}
        refreshing={loaded}
      /> */}
      {dataAcesses?.map((item: any) => renderItemAccess(item))}
      {dataOrders?.map((item: any) => renderItemOrder(item))}
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

export default Accesses;
