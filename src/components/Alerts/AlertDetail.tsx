import React from 'react';
import useApi from '../../../mk/hooks/useApi';
import Modal from '../../../mk/components/ui/Modal/Modal';
import {cssVar} from '../../../mk/styles/themes';
import {Text, View} from 'react-native';
import {getFullName} from '../../../mk/utils/strings';
import {getDateTimeStrMes} from '../../../mk/utils/dates';

type PropsType = {
  id: any;
  open: boolean;
  onClose: () => void;
};
const nivelAlerta = ['', 'Bajo', 'Medio', 'Alto'];
export const AlertDetail = ({id, open, onClose}: PropsType) => {
  const {data: details, loaded} = useApi('/alerts', 'GET', {
    perPage: 1,
    page: 1,
    relations: 'guardia:id,ci,name,middle_name,last_name,mother_last_name',
    searchBy: 'id,=,' + id,
  });

  return (
    <Modal
      open={open}
      containerStyles={{
        borderColor: cssVar.cError,
        borderWidth: 1,
      }}
      headerStyles={{color: cssVar.cError}}
      title={'¡Alerta nivel ' + nivelAlerta[details?.data.level] + '!'}
      overlayClose={true}
      buttonCancel="Cerrar"
      onClose={onClose}>
      <View>
        {/* {!loaded ? (
          <LoadingView theme={theme} />
        ) : ( */}
        <>
          <Text
            style={{
              color: cssVar.cWhite,
              fontSize: 14,
              textAlign: 'center',
            }}>
            {details?.data.descrip}
          </Text>
          <Text
            style={{
              color: cssVar.cWhiteV2,
              fontSize: 12,
              textAlign: 'center',
              marginTop: 10,
            }}>
            Reportó: {getFullName(details?.data.guardia)}
          </Text>
          <Text
            style={{
              color: cssVar.cWhiteV2,
              fontSize: 10,
              textAlign: 'center',
            }}>
            {getDateTimeStrMes(details?.data.created_at)}
          </Text>
        </>
        {/* )} */}
      </View>
    </Modal>
  );
};
