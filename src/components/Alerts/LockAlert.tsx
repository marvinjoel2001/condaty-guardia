import React, {useEffect} from 'react';
import Modal from '../../../mk/components/ui/Modal/Modal';
import {Text, View} from 'react-native';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import Icon from '../../../mk/components/ui/Icon/Icon';
import Sound from 'react-native-sound';
import {getUrlImages} from '../../../mk/utils/strings';
import useApi from '../../../mk/hooks/useApi';
import {typeAlerts} from './alertConstants';
import useAuth from '../../../mk/hooks/useAuth';

const LockAlert = ({ open, onClose, data }: any) => {
  const { execute } = useApi();
  const {showToast} = useAuth();

  if (!data) {
    return null;
  }

  useEffect(() => {
    if (open) {
      const alertSound = new Sound(
        'sound_alert.mp3',
        Sound.MAIN_BUNDLE,
        error => {
          if (error) {
            console.log('Error al cargar el sonido:', error);
            return;
          }
          alertSound.setVolume(0.5);
          alertSound.play(success => {
            if (!success) {
              console.log('Error al reproducir el sonido');
            }
          });
        },
      );

      return () => {
        alertSound.release();
      };
    }
  }, [open]);
  const _onClose = () => {
    onClose();
  };

  const onSaveAttend = async () => {
    const {data: response} = await execute('/attend', 'POST', {
      id: data?.id,
    });
    if (response?.success) {
      _onClose();
    }else{
      showToast(response?.message, 'error');
      _onClose();
    }
  };
  return (
    <Modal
      title="Alerta de emergencia"
      open={open}
      onClose={onClose}
      buttonText="Atender"
      onSave={onSaveAttend}
      containerStyles={{
        borderWidth: 1,
        borderColor: cssVar.cError,
      }}
      iconClose={true}>
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
            src={getUrlImages(
              '/OWNER-' + data?.owner_id + '.webp?d=' + data?.owner_updated_at,
            )}
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
          backgroundColor: data?.type && typeAlerts[data.type as keyof typeof typeAlerts]?.color?.background || 'transparent',
          borderWidth: 1,
          borderColor: data?.type && typeAlerts[data?.type as keyof typeof typeAlerts]?.color?.border,
          padding: 8,
          borderRadius: 8,
          alignSelf: 'center',
          marginTop: 12,
        }}>
        <Icon
          name={data?.type && typeAlerts[data?.type as keyof typeof typeAlerts]?.icon}
          color={cssVar.cWhite}
          size={36}
        />
        <Text
          style={{
            color: cssVar.cWhiteV1,
            fontSize: 12,
            fontFamily: FONTS.regular,
          }}>
          {typeAlerts[data?.type as keyof typeof typeAlerts]?.name}
        </Text>
      </View>
    </Modal>
  );
};

export default LockAlert;
