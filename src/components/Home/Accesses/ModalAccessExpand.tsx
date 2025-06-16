import React from 'react';
import Modal from '../../../../mk/components/ui/Modal/Modal';
import useApi from '../../../../mk/hooks/useApi';
import {Text} from 'react-native';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import {getFullName} from '../../../../mk/utils/strings';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import KeyValue from '../../../../mk/components/ui/KeyValue';
import {getDateTimeStrMes} from '../../../../mk/utils/dates';
import Loading from '../../../../mk/components/ui/Loading/Loading';
interface PropsType {
  id: string | number | null;
  open: boolean;
  onClose: () => void;
  type: 'A' | 'T' | 'I' | string;
}
const typeInvitation: any = {
  G: 'QR grupal',
  I: 'QR individual',
  F: 'QR frecuente',
  O: 'Llave QR',
  P: 'Pedido',
  C: 'Sin QR',
};
const ModalAccessExpand = ({id, open, onClose, type}: PropsType) => {
  const {data, loaded} = useApi('/accesses', 'GET', {
    fullType: 'DET',
    searchBy: id,
    perPage: -1,
    page: 1,
  });

  //   if (!loaded) {
  //     return;
  //   }
  console.log(data);
  return (
    <Modal
      title={
        type === 'A'
          ? 'Detalle del acompañante'
          : type === 'T'
          ? 'Detalle del taxista'
          : type === 'I'
          ? 'Detalle de la invitación'
          : ''
      }
      open={open}
      onClose={onClose}>
      {!loaded ? (
        <Loading />
      ) : (
        <>
          <ItemList
            key={data?.id}
            title={getFullName(data?.data?.[0]?.visit)}
            subtitle={'C.I:' + data?.data?.[0]?.visit?.ci}
            left={<Avatar name={getFullName(data?.data?.[0]?.visit)} />}
          />
          <KeyValue
            keys="Tipo de acceso"
            value={typeInvitation[data?.data?.[0]?.type]}
          />
          {data?.data?.[0]?.plate && (
            <KeyValue keys="Placa" value={data?.data?.[0]?.plate || '-/-'} />
          )}
          <KeyValue
            keys="Fecha y hora de ingreso"
            value={getDateTimeStrMes(data?.data?.[0]?.in_at, true)}
          />
          <KeyValue
            keys="Fecha y hora de salida"
            value={getDateTimeStrMes(data?.data?.[0]?.out_at, true)}
          />
          <KeyValue
            keys={
              data?.data?.[0]?.out_guard || !data?.data?.[0]?.out_at
                ? 'Guardia de ingreso'
                : 'Guardia de ingreso y salida'
            }
            value={getFullName(data?.data?.[0]?.guardia)}
          />
          {data?.data?.[0]?.out_guard && (
            <KeyValue
              keys="Guardia de salida"
              value={getFullName(data?.data?.[0]?.out_guard)}
            />
          )}
          <KeyValue
            keys="Observación de ingreso"
            value={data?.data?.[0]?.obs_in || '-/-'}
          />
          <KeyValue
            keys="Observación de salida"
            value={data?.data?.[0]?.obs_out || '-/-'}
          />
        </>
      )}
    </Modal>
  );
};

export default ModalAccessExpand;
