// DetPedidos.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import Card from '../../../../mk/components/ui/Card/Card';

import useApi from '../../../../mk/hooks/useApi';
import { getDateStrMes } from '../../../../mk/utils/dates';
import { getFullName } from '../../../../mk/utils/strings';
import { cssVar } from '../../../../mk/styles/themes';
import LineDetail from '../Accesses/shares/LineDetail';
import { TextArea } from '../../../../mk/components/forms/TextArea/TextArea';
import { getAccessStatus } from '../../../../mk/utils/utils';

const DetOrders = ({ id, open, close, reload }: any) => {
  const { execute, waiting } = useApi();
  const [data, setData]: any = useState(null);
  const [formState, setFormState]: any = useState({}); // Para obs_in / obs_out u otros campos
  const [acompanSelect, setAcompSelect]: any = useState([]); // Si en pedidos hay acompañantes

  useEffect(() => {
    const getData = async (id: number) => {
      // Suponiendo que para pedidos usas otro endpoint (o envías type "P")
      const { data } = await execute('/others', 'GET', {
        fullType: 'DET',
        searchBy: id,
        section: 'HOME',
      });
      if (data.success) {
        // Si el pedido tiene algún atributo que lo redirija a otro registro, podrías hacer una recursión similar a accesses
        setData(data?.data?.length > 0 ? data?.data[0] : null);
      }
    };
    if (id) {
      getData(id);
    }
  }, [id]);

  const getStatus = () => {
    
    if (!data?.in_at) return 'Y';
    if (data?.in_at && !data?.out_at) return 'I';
    if (data?.out_at) return 'C';
    return '';
  };

  const getButtonText = () => {
    const status = getStatus();
    const mapping: Record<string, string> = {
      I: 'Dejar salir',
      Y: 'Dejar entrar',
      // S: 'Esperando confirmación',
      C: 'Completado',
    };
    return mapping[status] || '';
  };
  

  const handleInputChange = (name: string, value: string) => {
    setFormState({ ...formState, [name]: value });
  };

  const handleSave = async () => {
    const status = getStatus();
    if (status === 'I') {
      // Acción: Dejar salir. En pedidos podría ser que se registre la salida del pedido.
      // Si tienes acompañantes para un pedido, puedes validar que se hayan seleccionado
      if (acompanSelect.length === 0) {
        console.log('Debe seleccionar al menos un acompañante para dejar salir');
        return;
      }
      const ids = acompanSelect.map((item: any) => item.id);
      const { data: result, error } = await execute('/others/exit', 'POST', {
        ids,
        obs_out: formState?.obs_out || '',
      });
      if (result?.success) {
        reload();
        close();
      } else {
        console.log('Error al dejar salir:', error);
      }
    } else {
      // Acción: Dejar entrar
      const { data: result, error } = await execute('/orders/enter', 'POST', {
        id: data?.id,
        obs_in: formState?.obs_in || '',
      });
      if (result?.success) {
        reload();
        close();
      } else {
        console.log('Error al dejar entrar:', error);
      }
    }
  };

  // Renderizamos el detalle del pedido
  const renderDetails = () => {
    const status = getStatus();
    return (
      <>
        <LineDetail label="Estado" value={ getAccessStatus(data) } />
        <LineDetail
          label="Tipo de pedido"
          value={
            data?.type === 'P'
              ? 'Pedido-' + (data?.other?.otherType?.name || '')
              : 'Pedido'
          }
        />
        {/* Si es un pedido de Taxi, por ejemplo, podrías mostrar el nombre del conductor */}
        {data?.other?.otherType?.name === 'Taxi' && (
          <LineDetail label="Conductor" value={getFullName(data?.visit)} />
        )}
        {data?.plate && <LineDetail label="Placa" value={data?.plate} />}
        <LineDetail label="Entregó a" value={getFullName(data?.owner)} />
        {status === 'C' && data?.obs_confirm && (
          <>
            <LineDetail label="Observación" value={data?.obs_confirm} />
          </>
        )}
        {/* Puedes agregar más detalles según lo que necesites */}
      </>
    );
  };

  return (
    <ModalFull
      onClose={close}
      open={open}
      title={'Detalle de Pedido'}
      onSave={handleSave}
      buttonText={getButtonText()}>
      <Card>
        {renderDetails()}
        {/* Si requieres mostrar un TextArea para observaciones según la acción */}
        {getStatus() === 'Y' && (
          <TextArea
            label="Observaciones de Entrada"
            name="obs_in"
            value={formState?.obs_in || ''}
            onChange={(e) => handleInputChange('obs_in', e.target.value)}
          />
        )}
        {getStatus() === 'I' && (
          <TextArea
            label="Observaciones de Salida"
            name="obs_out"
            value={formState?.obs_out || ''}
            onChange={(e) => handleInputChange('obs_out', e.target.value)}
          />
        )}
      </Card>
    </ModalFull>
  );
};

const styles = StyleSheet.create({
  // Puedes definir estilos propios para DetOrders
});

export default DetOrders;
