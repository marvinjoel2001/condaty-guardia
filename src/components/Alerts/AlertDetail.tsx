import React, {useEffect, useState} from 'react';
import useApi from '../../../mk/hooks/useApi';
import Modal from '../../../mk/components/ui/Modal/Modal';
import {cssVar} from '../../../mk/styles/themes';
import {ActivityIndicator, Text, View} from 'react-native';
import {getFullName} from '../../../mk/utils/strings';
import {getDateTimeStrMes} from '../../../mk/utils/dates';

type PropsType = {
  id: any;
  open: boolean;
  onClose: () => void;
};
const nivelAlerta = ['', 'Bajo', 'Medio', 'Alto'];

const AlertDetail = ({id, open, onClose}: PropsType) => {
  const [details, setDetails]: any = useState({});

  const {execute, loaded} = useApi();

  const getAlert = async () => {
    const {data} = await execute('/alert', 'GET', {
      fullType: 'DET',
      searchBy: id,
    });
    if (data?.success) {
      setDetails(data?.data);
    }
  };
  useEffect(() => {
    getAlert();
  }, []);
  const _onClose = () => {
    onClose();
    setDetails({});
  };

  return (
    <Modal
      open={open}
      containerStyles={{
        borderColor: cssVar.cError,
        borderWidth: 1,
      }}
      headerStyles={{color: cssVar.cError}}
      title={
        details?.data?.id
          ? '¡Alerta nivel ' + nivelAlerta[details?.data?.level] + '!'
          : ''
      }
      overlayClose={true}
      buttonCancel="Cerrar"
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
              {details?.data?.descrip}
            </Text>
            <Text
              style={{
                color: cssVar.cWhiteV2,
                fontSize: 12,
                textAlign: 'center',
                marginTop: 10,
              }}>
              Reportó: {getFullName(details?.data?.guard_assigned)}
            </Text>
            <Text
              style={{
                color: cssVar.cWhiteV2,
                fontSize: 10,
                textAlign: 'center',
              }}>
              {getDateTimeStrMes(details?.data?.created_at)}
            </Text>
          </>
        )}
      </View>
    </Modal>
  );
};

export default AlertDetail;
