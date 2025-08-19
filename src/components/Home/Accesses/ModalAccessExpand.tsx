import React, {useEffect, useState} from 'react';
import Modal from '../../../../mk/components/ui/Modal/Modal';
import useApi from '../../../../mk/hooks/useApi';
import {Text, View} from 'react-native';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import KeyValue from '../../../../mk/components/ui/KeyValue';
import {getDateStrMes, getDateTimeStrMes} from '../../../../mk/utils/dates';
import Loading from '../../../../mk/components/ui/Loading/Loading';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import Br from '../../Profile/Br';
interface PropsType {
  id: string | number | null;
  open: boolean;
  onClose: () => void;
  type: 'A' | 'T' | 'I' | 'V' | 'P';
  invitation?: any;
}
const typeInvitation: any = {
  G: 'QR grupal',
  I: 'QR individual',
  F: 'QR frecuente',
  O: 'Llave QR',
  P: 'Pedido',
  C: 'Sin QR',
};

const ModalAccessExpand = ({
  id,
  open,
  onClose,
  type,
  invitation,
}: PropsType) => {
  const [data, setData]: any = useState([]);
  const {loaded, execute} = useApi();

  const getAccess = async () => {
    const {data} = await execute('/accesses', 'GET', {
      perPage: -1,
      page: 1,
      fullType: 'DET',
      searchBy: id,
    });
    if (data?.success) {
      setData(data?.data?.[0]);
    }
  };
  useEffect(() => {
    if (type != 'I' && type != 'P') {
      getAccess();
    }
  }, []);

  const rendeAccess = () => {
    return (
      <>
        <ItemList
          key={data?.id}
          title={getFullName(data?.visit)}
          subtitle={'C.I:' + data?.visit?.ci}
          left={<Avatar name={getFullName(data?.visit)} />}
        />
        <KeyValue keys="Tipo de acceso" value={typeInvitation[data?.type]} />
        {data?.plate && type == 'T' && (
          <KeyValue keys="Placa" value={data?.plate || '-/-'} />
        )}
        <KeyValue
          keys="Fecha y hora de ingreso"
          value={getDateTimeStrMes(data?.in_at, true)}
        />
        <KeyValue
          keys="Fecha y hora de salida"
          value={getDateTimeStrMes(data?.out_at, true)}
        />
        <KeyValue
          keys={
            data?.out_guard || !data?.out_at
              ? 'Guardia de ingreso'
              : 'Guardia de ingreso y salida'
          }
          value={getFullName(data?.guardia)}
        />
        {data?.out_guard && (
          <KeyValue
            keys="Guardia de salida"
            value={getFullName(data?.out_guard)}
          />
        )}
        <KeyValue keys="Observación de ingreso" value={data?.obs_in || '-/-'} />
        <KeyValue keys="Observación de salida" value={data?.obs_out || '-/-'} />
      </>
    );
  };

  function parseWeekDays(binaryNumber: number): string[] {
    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const result: string[] = [];

    for (let i = 0; i < 7; i++) {
      if (binaryNumber & (1 << i)) {
        result.push(diasSemana[i]);
      }
    }
    return result;
  }

  const renderInvitation = () => {
    return (
      <>
        <ItemList
          title={getFullName(invitation?.owner)}
          subtitle={
            'Unidad: ' +
            invitation?.owner?.dptos?.[0]?.nro +
            ', ' +
            invitation?.owner?.dptos?.[0]?.description
          }
          left={
            <Avatar
              name={getFullName(invitation?.owner)}
              src={getUrlImages(
                '/OWNER-' +
                  invitation?.owner?.id +
                  '.webp?d=' +
                  invitation?.owner?.updated_at,
              )}
            />
          }
          style={{marginBottom: 8}}
        />
        {invitation.type == 'G' && (
          <KeyValue
            keys="Nombre del evento"
            value={invitation?.title || '-/-'}
          />
        )}
        <KeyValue
          keys="Tipo de invitación"
          value={typeInvitation[invitation.type]}
        />
        {invitation.type != 'F' && (
          <>
            <KeyValue
              keys="Fecha de invitación"
              value={getDateStrMes(invitation?.date_event)}
            />
            <KeyValue keys="Descripción" value={invitation?.obs || '-/-'} />
          </>
        )}
        {invitation.type == 'F' && (
          <>
            {invitation?.start_date && (
              <KeyValue
                keys="Periodo de validez"
                value={
                  getDateStrMes(invitation?.start_date) +
                  ' a ' +
                  getDateStrMes(invitation?.end_date)
                }
              />
            )}
            <KeyValue keys="Indicaciones" value={invitation?.obs || '-/-'} />
            {invitation?.is_advanced == 'Y' && (
              <>
                <Br />
                <Text
                  style={{
                    fontSize: 16,
                    color: cssVar.cWhite,
                    fontFamily: FONTS.semiBold,
                    marginBottom: 12,
                  }}>
                  Configuración avanzada
                </Text>
                <KeyValue
                  keys="Días de acceso"
                  value={
                    parseWeekDays(invitation?.weekday)?.join(', ') || '-/-'
                  }
                />
                <KeyValue
                  keys="Horario permitido"
                  value={
                    invitation?.start_time.slice(0, 5) +
                      ' - ' +
                      invitation?.end_time.slice(0, 5) || '-/-'
                  }
                />
                {invitation?.max_entries && (
                  <KeyValue
                    keys="Cantidad de accesos"
                    value={invitation?.max_entries.toString() || '-/-'}
                  />
                )}
              </>
            )}
          </>
        )}
      </>
    );
  };
  const renderPedido = () => {
    return (
      <>
        <ItemList
          title={getFullName(invitation?.owner)}
          subtitle={
            'Unidad: ' +
            invitation?.owner?.dpto?.nro +
            ', ' +
            invitation?.owner?.dpto?.description
          }
          left={
            <Avatar
              name={getFullName(invitation?.owner)}
              src={getUrlImages(
                '/OWNER-' +
                  invitation?.owner?.id +
                  '.webp?d=' +
                  invitation?.owner?.updated_at,
              )}
            />
          }
          style={{marginBottom: 8}}
        />
        <KeyValue keys="Tipo de pedido" value={invitation?.other_type?.name} />
        <KeyValue
          keys="Fecha de notificación"
          value={getDateStrMes(invitation?.created_at)}
        />
        <KeyValue keys="Descripción" value={invitation?.descrip || '-/-'} />
      </>
    );
  };
  const getModalTitle = (type: string): string => {
    switch (type) {
      case 'A':
        return 'Detalle del acompañante';
      case 'T':
        return 'Detalle del taxista';
      case 'I':
      case 'P':
        return 'Detalle de la invitación';
      case 'V':
        return 'Detalle del visitante';
      default:
        return '';
    }
  };

  const renderModalContent = () => {
    if (!loaded) return <Loading />;

    switch (type) {
      case 'I':
        return renderInvitation();
      case 'P':
        return renderPedido();
      default:
        return rendeAccess();
    }
  };
  return (
    <Modal title={getModalTitle(type)} open={open} onClose={onClose}>
      {renderModalContent()}
    </Modal>
  );
};

export default ModalAccessExpand;
