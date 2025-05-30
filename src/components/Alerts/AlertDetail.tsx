import React, {useEffect, useState} from 'react';
import useApi from '../../../mk/hooks/useApi';
import Modal from '../../../mk/components/ui/Modal/Modal';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {getFullName, getUrlImages} from '../../../mk/utils/strings';
import {getDateTimeAgo, getDateTimeStrMes} from '../../../mk/utils/dates';
import Button from '../../../mk/components/forms/Button/Button';
import {levelAlerts, statusColorPanic} from './Alerts';
import KeyValue from '../../../mk/components/ui/KeyValue';
import LineDetail from '../Home/Accesses/shares/LineDetail';
import {
  IconAlert,
  IconAmbulance,
  IconFlame,
  IconTheft,
} from '../../icons/IconLibrary';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';

type PropsType = {
  id: any;
  open: boolean;
  onClose: () => void;
};

const AlertDetail = ({id, open, onClose}: PropsType) => {
  const [details, setDetails]: any = useState({});

  const {execute, loaded} = useApi();

  const getAlert = async () => {
    const {data} = await execute('/alerts', 'GET', {
      fullType: 'DET',
      searchBy: id,
    });
    if (data?.success) {
      setDetails(data?.data?.data);
    }
  };
  useEffect(() => {
    getAlert();
  }, []);
  const _onClose = () => {
    onClose();
    setDetails({});
  };
  const renderAlertPanic = () => {
    let icon: any;

    switch (details?.type) {
      case 'F':
        icon = IconFlame;
        break;
      case 'E':
        icon = IconAmbulance;
        break;
      case 'T':
        icon = IconTheft;
        break;
      case 'O':
        icon = IconAlert;
        break;
      default:
    }
    return (
      <View
        style={{
          ...styles.alertPanic,
          backgroundColor: statusColorPanic[details?.type]?.background,
          borderColor: statusColorPanic[details?.type]?.border,
        }}>
        <Icon name={icon} color={cssVar.cWhite} />
        <Text
          style={{
            ...styles.text,
            color: cssVar.cWhite,
            marginTop: 8,
          }}>
          {details?.descrip}
        </Text>
      </View>
    );
  };

  const onSaveAttend = async () => {
    const {data} = await execute('/attend', 'POST', {
      id: details?.id,
    });
    if (data?.success == true) {
      _onClose();
    }
  };

  const Br = () => {
    return (
      <View
        style={{
          height: 0.5,
          backgroundColor: cssVar.cWhiteV1,
          marginVertical: 12,
          width: '100%',
        }}
      />
    );
  };
  return (
    <Modal
      open={open}
      // containerStyles={{
      //   borderColor: colorAlert,
      //   borderWidth: 1,
      // }}
      // headerStyles={{color: colorAlert}}
      // title={
      //   details?.id ? '¡Alerta nivel ' + levelAlerts[details?.level] + '!' : ''
      // }
      title="Detalle de alerta"
      onSave={onSaveAttend}
      buttonText={
        !details?.date_at && details?.level == 4 ? 'Marcar como atendida' : ''
      }
      onClose={_onClose}>
      <View>
        {!loaded ? (
          <Text style={{color: cssVar.cWhite}}>Cargando...</Text>
        ) : (
          <>
            {details?.level == 4 && (
              <>
                <KeyValue
                  keys="Unidad:"
                  value={
                    details?.owner?.dpto?.[0]?.nro +
                    ', ' +
                    details?.owner?.dpto?.[0]?.description
                  }
                />
                <KeyValue
                  keys="Residente:"
                  value={getFullName(details?.owner)}
                />
                <Br />
              </>
            )}
            <Text
              style={{
                ...styles.text,
              }}>
              {details?.level == 4 ? 'Tipo de emergencia' : details?.descrip}
            </Text>
            {details?.level == 4 && renderAlertPanic()}
            <Br />
            <Text style={{...styles.text}}>
              {details?.level == 4 ? 'Atendida por:' : 'Informante:'}
            </Text>
            {details?.level == 4 ? (
              details?.gua_attend || details?.adm_attend ? (
                <ItemList
                  title={getFullName(
                    details?.gua_attend || details?.adm_attend,
                  )}
                  subtitle={
                    details?.gua_attend
                      ? 'Guardia -' + getDateTimeStrMes(details?.date_at, true)
                      : 'Administrador -' +
                        getDateTimeStrMes(details?.date_at, true)
                  }
                  left={
                    <Avatar
                      src={
                        details?.gua_attend
                          ? getUrlImages(
                              '/GUARD-' +
                                details?.gua_attend?.id +
                                '.webp?d=' +
                                details?.updated_at,
                            )
                          : getUrlImages(
                              '/ADM-' +
                                details?.adm_attend?.id +
                                '.webp?d=' +
                                details?.updated_at,
                            )
                      }
                      name={getFullName(
                        details?.gua_attend || details?.adm_attend,
                      )}
                    />
                  }
                />
              ) : (
                <Text style={{...styles.text, opacity: 0.6}}>
                  No se ha asignado un encargado
                </Text>
              )
            ) : (
              <ItemList
                title={getFullName(details?.guardia)}
                subtitle={
                  'Guardia' +
                  ' - ' +
                  getDateTimeStrMes(details?.created_at, true)
                }
                left={
                  <Avatar
                    src={getUrlImages(
                      '/GUARD-' +
                        details?.guardia?.id +
                        '.webp?d=' +
                        details?.updated_at,
                    )}
                    name={getFullName(details?.guardia)}
                  />
                }
              />
            )}
          </>
        )}
      </View>
    </Modal>
  );
};

export default AlertDetail;

const styles = StyleSheet.create({
  text: {
    color: cssVar.cWhiteV1,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  alertPanic: {
    borderWidth: 1,
    padding: 8,
    width: 168,
    borderRadius: 8,
    marginTop: 12,
    margin: 'auto',
  },
});
