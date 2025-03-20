import React, { useEffect, useState } from 'react';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import { View } from 'react-native';
import { Text } from 'react-native';
import Card from '../../../../mk/components/ui/Card/Card';
import { cssVar } from '../../../../mk/styles/themes';
import LineDetail from './shares/LineDetail';
import useApi from '../../../../mk/hooks/useApi';
import { getAccessStatus, getAccessType } from '../../../../mk/utils/utils';
import { getDateStrMes } from '../../../../mk/utils/dates';
import { getFullName } from '../../../../mk/utils/strings';

const DetAccesses = ({ id, open, close, reload }: any) => {
  const { execute, waiting } = useApi();
  const [data, setData]: any = useState(null);

  useEffect(() => {
    const getData = async (id: number) => {
      const { data } = await execute('/accesses', 'GET', {
        fullType: 'DET',
        searchBy: id,
      });
      if (data.success) {
        setData(data?.data?.length > 0 ? data?.data[0] : null);
      }
    };
    if (id) {
      getData(id);
    }
  }, [id]);

  //study case
  //
  const dummy = (e: string) => {
    console.log('dummy', e);
  };

  const getStatus = () => {
    if (data?.out_at) return 'C';
    if (data?.in_at && !data?.out_at) return 'I';

    return '';
  };

  let status = getAccessStatus(data);
  let accessType = getAccessType(data);


  return (
    <ModalFull
      onClose={close}
      open={open}
      title={'Detalle'}
      onSave={dummy}
      // buttonExtra={'extra'}
      buttonCancel={getStatus() == 'C' ? '' : 'cancelar'}
      buttonText={getStatus() == 'C' ? '' : 'Grabar'}>
      <Card>
      <LineDetail label="Estado" value={status} />
      <LineDetail label="Tipo" value={accessType} />
        {(data?.type === "I" || data?.type === "G") && data?.invitation && (
              <>
                {data?.type === "G" && data?.invitation?.title && (<LineDetail label="Evento" value={data?.invitation?.title} /> )}
                <LineDetail label="Fecha de invitación" value={getDateStrMes(data?.invitation?.date_event)}/>
                {data?.invitation?.obs && ( <LineDetail label="Descripción" value={data?.invitation?.obs} />)}
              </> 
        )}
        {data?.type === "P" && ( <LineDetail label="Conductor" value={getFullName(data?.visit)} />)}
        {data?.plate && !data?.taxi && <LineDetail label="Placa" value={data?.plate} />}
        <LineDetail label={data?.in_at && data?.out_at ? "Visitó a" : "Visita a"}  value={getFullName(data?.owner)}/>
        {status === "Denegado" && (
                <>
                  <LineDetail label="Fecha de denegación" value={getDateStrMes(data?.confirm_at)} />
                  <LineDetail label="Motivo" value={data?.obs_confirm} />
                </>
        )}
            {data?.out_at ? (
          <>
            <LineDetail label="Guardia de entrada" value={getFullName(data?.guardia)} />
            {data?.out_guard && data?.guardia?.id !== data?.out_guard?.id && (
              <LineDetail label="Guardia de salida" value={getFullName(data?.out_guard)} />
            )}
            {data?.obs_guard && <LineDetail label="Obs. de solicitud" value={data?.obs_guard} />}
            {data?.obs_in && <LineDetail label="Obs. de entrada" value={data?.obs_in} />}
            {data?.obs_out && <LineDetail label="Obs. de salida" value={data?.obs_out} />}
          </>
        ) : (
          <>
            {data?.obs_in ? (
              <LineDetail label="Obs. de entrada" value={data?.obs_in} />
            ) : data?.obs_out ? (
              <LineDetail label="Obs. de salida" value={data?.obs_out} />
            ) : null}
          </>
        )}
        {/* <Text style={{ color: 'white' }}>{JSON.stringify(data)}</Text> */}

      </Card>
    </ModalFull>
  );
};

export default DetAccesses;
