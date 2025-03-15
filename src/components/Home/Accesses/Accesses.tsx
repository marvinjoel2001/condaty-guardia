import React, { useState } from 'react';
import {Text, TouchableOpacity} from 'react-native';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconDelivery, IconOther, IconTaxi} from '../../../icons/IconLibrary';
import List from '../../../../mk/components/ui/List/List';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import ItemListDate from './shares/ItemListDate';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import DetailAccess from './DetailAccess';

const Accesses = ({data,reload}: any) => {
  const [openDetail,setOpenDetail]= useState(false);
  const [edit,setEdit] = useState(false);
  const [formState,setFormState]:any = useState({});
  const screenParams: any = useState(null);
  return <> 
  <List data={data} renderItem={(e)=>renderItemAccess(e,setOpenDetail)} />;
{ openDetail &&  <DetailAccess
        id={formState?.id}
        open={openDetail}
        close={() => setOpenDetail(false)}
        reload={reload}
        edit={edit}
        screenParams={screenParams}
      />}
  </>
};

const title = (item: any) => {
  return item.type == 'O' ?<Text> {getFullName(item.owner) }</Text> : <Text>{getFullName(item.visit)}</Text>;
};

const subtitle = (item: any) => {
  if (item.type == 'O') {
    return 'uso LLAVE VIRTUAL QR';
  }

  let prefix = 'Visitó a: ';

  if (item.type == 'P' && item.other?.otherType?.name == 'Taxi') {
    prefix = 'Recogió a: ';
  }
  if (item.type == 'P' && item.other?.otherType?.name == 'Mensajeria') {
    prefix = 'Entregó a: ';
  }
  if (item.type == 'P' && item.other?.otherType?.name == 'Delivery') {
    prefix = 'Entregó a: ';
  }
  if (item.type == 'P' && item.other?.otherType?.name == 'Otro') {
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
      outDate={item.type != 'O' ? item.out_at : null}
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

  // Caso default para no pedidos
  const avatarSrc = getUrlImages(
    item.type === 'O'
      ? `/OWN-${item.owner_id}.png?d=${item.updated_at}`
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

const commonTextStyle = {fontSize: 10, fontFamily: FONTS.regular};

const handlePress = (item: any) => console.log('handlePress Acceses', item);

const waitingConfirmation = (item: any) => {
  return <Text style={commonTextStyle}>Esperando Confirmación</Text>;
};

const allowIn = (item: any) => {
  return (
    <TouchableOpacity
      style={{
        // ...theme.buttons?.primary,
        borderRadius: 10,
      }}
      onPress={() => handlePress(item)}
      accessibilityLabel={`Dejar entrar a ${getFullName(item.visit)}`}>
      <Text
        style={{
          ...commonTextStyle,
          color: cssVar.cAccent,
          paddingHorizontal: 8,
          paddingVertical: 4,
          marginTop: 1,
        }}>
        Dejar entrar
      </Text>
    </TouchableOpacity>
  );
};

const allotOut = (item: any) => {
  return (
    <TouchableOpacity
      style={{
        // ...theme.buttons?.secondary,
        borderRadius: 10,
      }}
      onPress={handlePress}
      accessibilityLabel={`Ver detalles de ${getFullName(item.visit)}`}>
      <Text
        style={{
          ...commonTextStyle,
          paddingHorizontal: 10,
          paddingVertical: 4,
          color: cssVar.cWhiteV2,
        }}>
        Dejar salir
      </Text>
    </TouchableOpacity>
  );
};

const notAutorized = (item: any) => {
  return (
    <Text style={{...commonTextStyle, color: cssVar.cError}}>
      No Autorizado
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

  if (
    item?.type !== 'O' &&
    item?.in_at &&
    !item?.out_at
    // && edit
  ) {
    return allotOut(item);
  }

  return null;
};

const renderItemAccess = (item:any,setOpenDetail: any) => {
  return (

    <ItemList
      title={title(item)}
      subtitle={subtitle(item)}
      left={icon(item)}
      right={right(item)}
      date={hours(item)}
      widthMain={150}
      onPress={() => setOpenDetail(true)}
    />
  );
};

export default Accesses;
