import React, {useEffect, useState} from 'react';
import useApi from '../../../mk/hooks/useApi';
import Modal from '../../../mk/components/ui/Modal/Modal';
import {cssVar} from '../../../mk/styles/themes';
import {ActivityIndicator, Text, View} from 'react-native';
import {getFullName} from '../../../mk/utils/strings';
import {getDateTimeStrMes} from '../../../mk/utils/dates';
import Button from '../../../mk/components/forms/Button/Button';
import {levelAlerts} from './Alerts';
import KeyValue from '../../../mk/components/ui/KeyValue';
import LineDetail from '../Home/Accesses/shares/LineDetail';

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
  const colorAlert =
    details?.level === 3
      ? cssVar.cError
      : details?.level === 2
      ? cssVar.cWarning
      : cssVar.cSuccess;

  const onSaveAttend = async () => {
    const {data} = await execute('/attend', 'POST', {
      id: details?.id,
    });
    console.log(data);
    if (data?.success == true) {
      _onClose();
    }
  };
  console.log(details);
  return (
    <Modal
      open={open}
      containerStyles={{
        borderColor: colorAlert,
        borderWidth: 1,
      }}
      headerStyles={{color: colorAlert}}
      title={
        details?.id ? '¡Alerta nivel ' + levelAlerts[details?.level] + '!' : ''
      }
      overlayClose={true}
      // buttonCancel="Cerrar"
      onClose={_onClose}>
      <View>
        {!loaded ? (
          <Text style={{color: cssVar.cWhite}}>Cargando...</Text>
        ) : (
          <>
            <Text
              style={{
                color: cssVar.cWhite,
                fontSize: 14,
                textAlign: 'center',
              }}>
              {details?.descrip}
            </Text>
            {/* <Text
              style={{
                color: cssVar.cWhiteV2,
                fontSize: 12,
                textAlign: 'center',
                marginTop: 10,
              }}>
              Reportó:{' '}
              {getFullName(
                details.level == 4 ? details?.owner : details?.guardia,
              )}
            </Text> */}
            <View style={{marginVertical: 10}}>
              <LineDetail
                label={'Reportó'}
                value={getFullName(
                  details.level == 4 ? details?.owner : details?.guardia,
                )}
              />
              {details?.date_at && (
                <>
                  <LineDetail
                    label={'Fue atendido por'}
                    value={getFullName(
                      details?.gua_attend
                        ? details?.gua_attend
                        : details?.adm_attend,
                    )}
                  />
                  <LineDetail
                    label={'Fecha de atención'}
                    value={getDateTimeStrMes(details?.date_at, true)}
                  />
                </>
              )}
            </View>
            {/* <Text
              style={{
                color: cssVar.cWhiteV2,
                fontSize: 10,
                textAlign: 'center',
              }}>
              {getDateTimeStrMes(details?.created_at, true)}
            </Text> */}
            {!details?.date_at && details?.level == 4 && (
              <Button onPress={onSaveAttend}>Marcar como atendido</Button>
            )}
          </>
        )}
      </View>
    </Modal>
  );
};

export default AlertDetail;
