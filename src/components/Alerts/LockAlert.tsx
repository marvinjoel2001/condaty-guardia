import React from 'react';
import Modal from '../../../mk/components/ui/Modal/Modal';
import {Text, View} from 'react-native';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {
  IconAccess,
  IconAlert,
  IconAmbulance,
  IconFlame,
  IconTheft,
} from '../../icons/IconLibrary';
import {getUrlImages} from '../../../mk/utils/strings';

const typeAlerts: any = {
  E: {
    name: 'Emergencia Medica',
    icon: IconAmbulance,
    color: {background: cssVar.cHoverError, border: cssVar.cError},
  },
  F: {
    name: 'Incendio',
    icon: IconFlame,
    color: {background: cssVar.cHoverWarning, border: cssVar.cWarning},
  },
  T: {
    name: 'Robo',
    icon: IconTheft,
    color: {background: cssVar.cHoverInfo, border: cssVar.cInfo},
  },
  O: {
    name: 'Otro',
    icon: IconAlert,
    color: {background: cssVar.cHoverInfo, border: cssVar.cInfo},
  },
};

const LockAlert = ({open, onClose, data}: any) => {
  if (!data) {
    return null;
  }
  return (
    <Modal
      title="Alerta de emergencia"
      open={open}
      onClose={onClose}
      buttonText="Atender"
      onSave={onClose}
      containerStyles={{
        borderWidth: 1,
        borderColor: cssVar.cError,
      }}
      iconClose={false}>
      <Text
        style={{
          color: cssVar.cWhiteV1,
          fontSize: 12,
          fontFamily: FONTS.regular,
        }}>
        Residente
      </Text>
      <ItemList
        title={data?.owner_name}
        subtitle={'Unidad: ' + data?.unit}
        left={
          <Avatar
            src={getUrlImages('/OWNER-' + data?.owner_id + '.webp?d=')}
            name={data?.owner_name}
          />
        }
      />
      <Text
        style={{
          color: cssVar.cWhiteV1,
          fontSize: 12,
          fontFamily: FONTS.regular,
        }}>
        Tipo de emergencia
      </Text>
      <View
        style={{
          width: 164,
          backgroundColor: typeAlerts[data?.type]?.color?.background,
          borderWidth: 1,
          borderColor: typeAlerts[data?.type]?.color?.border,
          padding: 8,
          borderRadius: 8,
          alignSelf: 'center',
          marginTop: 12,
        }}>
        <Icon
          name={typeAlerts[data?.type]?.icon}
          color={cssVar.cWhite}
          size={36}
        />
        <Text
          style={{
            color: cssVar.cWhiteV1,
            fontSize: 12,
            fontFamily: FONTS.regular,
          }}>
          {data?.name}
        </Text>
      </View>
    </Modal>
  );
};

export default LockAlert;
