import React, {useEffect, useState} from 'react';
import {Text, TouchableOpacity} from 'react-native';
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

const Accesses = ({data, reload, setDataID, loaded}: any) => {
  const [openDetail, setOpenDetail] = useState(false);
  const [edit, setEdit] = useState(false);
  const [formState, setFormState]: any = useState({});
  const screenParams: any = useState(null);

  useEffect(() => {
    setDataID(62);
  }, [openDetail]);

  const onPressDetail = (item: any) => {
    setOpenDetail(true);
    setFormState({id: item.id});
  };

  const handleAction = (item: any) => {
    if (!item?.in_at && item?.confirm_at && item?.confirm === 'Y') {
      onPressDetail(item);
    } else if (item.in_at && !item.out_at) {
      onPressDetail(item);
    } else {
      onPressDetail(item);
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
        Esperando Confirmación
      </Text>
    );
  };

  const right = (item: any) => {
    if (!item?.in_at && !item?.confirm_at) {
      return waitingConfirmation(item);
    }
    if (!item?.in_at && item?.confirm_at) {
      if (item?.confirm === 'Y') {
        return allowIn(item);
      } else if (item?.confirm === 'N') {
        return notAutorized(item);
      }
    }
    if (item?.type !== 'O' && item?.in_at && !item?.out_at) {
      return allotOut(item);
    }
    return null;
  };

  const title = (item: any) => {
    return item.type === 'O' ? (
      <Text>{getFullName(item.owner)}</Text>
    ) : (
      <Text>{getFullName(item.visit)}</Text>
    );
  };

  const subtitle = (item: any) => {
    if (item.type === 'O') {
      return 'uso LLAVE VIRTUAL QR';
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

  const hours = (item: any) => {
    return (
      <ItemListDate
        inDate={item.in_at}
        outDate={item.type !== 'O' ? item.out_at : null}
      />
    );
  };

  const icon = (item: any) => {
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

  const renderItemAccess = (item: any, onPressDetail: (item: any) => void) => {
    return (
      <ItemList
        title={title(item)}
        subtitle={subtitle(item)}
        left={icon(item)}
        right={right(item)}
        date={hours(item)}
        widthMain={150}
        onPress={() => onPressDetail(item)}
      />
    );
  };
  return (
    <>
      <List
        data={data}
        renderItem={item => renderItemAccess(item, onPressDetail)}
        refreshing={loaded}
      />
      {openDetail && (
        <DetAccesses
          id={formState?.id}
          open={openDetail}
          close={() => setOpenDetail(false)}
          reload={reload}
          // execute={execute}
        />
        // <DetailContainer
        //   id={formState?.id}
        //   open={openDetail}
        //   close={() => setOpenDetail(false)}
        //   reload={reload}
        //   edit={edit}
        //   type="accesos"
        //   detailComponent={AccessDetail}
        //   screenParams={screenParams}
        // />
      )}
    </>
  );
};

export default Accesses;
