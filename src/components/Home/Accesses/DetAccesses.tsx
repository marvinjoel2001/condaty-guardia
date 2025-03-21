// DetAccesses.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import Card from '../../../../mk/components/ui/Card/Card';
import { cssVar, FONTS } from '../../../../mk/styles/themes';
import LineDetail from './shares/LineDetail';
import useApi from '../../../../mk/hooks/useApi';
import { getAccessType } from '../../../../mk/utils/utils';
import { getDateStrMes } from '../../../../mk/utils/dates';
import { getFullName } from '../../../../mk/utils/strings';
import List from '../../../../mk/components/ui/List/List';
import { TextArea } from '../../../../mk/components/forms/TextArea/TextArea';
import { ItemList } from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import ItemListDate from './shares/ItemListDate';
import { IconCheck, IconCheckOff } from '../../../icons/IconLibrary';
import useAuth from '../../../../mk/hooks/useAuth';

const DetAccesses = ({id, open, close, reload}: any) => {
  const {showToast} = useAuth();
  const {execute, waiting} = useApi();
  const [data, setData]: any = useState(null);
  const [acompanSelect, setAcompSelect]: any = useState([]);
  const [formState, setFormState]: any = useState({}); // estado para obs_in / obs_out
console.log(acompanSelect,'acompanSelect')
  useEffect(() => {
    const getData = async (id: number) => {
      const {data} = await execute('/accesses', 'GET', {
        fullType: 'DET',
        searchBy: id,
      });
      if (data.success) {
        if (data.data[0].access_id) return getData(data.data[0].access_id);
        setData(data?.data?.length > 0 ? data?.data[0] : null);
        console.log('DET', data.data);
      }
    };
    if (id) {
      getData(id);
    }
  }, [id]);

  const handleSave = async () => {
    const status = getStatus();

    // console.log(ids,'status desde save',acompanSelect)
    if (status === 'I') {
   
        if (Object.values(acompanSelect).every(value => !value)) {
          console.log(
            'Debe seleccionar al menos un acompañante para dejar salir',
          );
          showToast('Debe seleccionar al menos un acompañante para dejar salir','error');
          return;
        }
      // const ids = acompanSelect.map((item: any) => item.id);
      const ids = Object.keys(acompanSelect)
      .filter(id => acompanSelect[id])
      .map(id => Number(id));

      console.log(ids,'idsss')
      const {data: result, error} = await execute('/accesses/exit', 'POST', {
        ids,
        obs_out: formState?.obs_out || '',
      },false,3);
      if (result?.success) {
        reload();
        close();
        showToast("El visitante salió", "success");
      } else {
        console.log('Error en dejar salir:', error);
        showToast("Error al dejar salir", "error");
      }
    } else {
      const {data: result, error} = await execute('/accesses/enter', 'POST', {
        id: data?.id,
        obs_in: formState?.obs_in || '',
      });
      if (result?.success) {
        reload();
        close();
      } else {
        console.log('Error en dejar entrar:', error);
      }
    }
  };

  const getStatus = (acceso: any = null) => {
    const _data = acceso || data;
    //status
    // S=Solicitud de confirmacion
    // Y = solicitud confirmada
    // N = Solicitid rechazada
    // I=Ingreso falta que salga
    // C=completado
    if (!_data?.in_at && !_data?.out_at && !_data?.confirm_at) return 'S';
    if (!_data?.in_at && !_data?.out_at && _data.confirm) return _data.confirm;
    if (_data?.in_at && !_data?.out_at) return 'I';
    if (_data?.out_at) return 'C';
    return '';
  };

  let accessType = getAccessType(data);

  // Actualiza formState para las observaciones
  const handleInputChange = (name: string, value: string) => {
    console.log(name,value,'name value')
    setFormState({...formState, [name]: value});
  };

  const getButtonText = () => {
    const status = getStatus();
    const buttonTexts: Record<string, string> = {
      I: 'Dejar salir',
      Y: 'Dejar entrar',
      S: 'Esperando Cnfirmacion',
      C: 'Completado',
    };
    return buttonTexts[status] || '';
  };

  const cardDetail = () => {
    const status = getStatus();
    return (
      <>
        <LineDetail label="Estado" value={status} />
        <LineDetail label="Tipo" value={accessType} />
        {(data?.type === 'I' || data?.type === 'G') && data?.invitation && (
          <>
            {data?.type === 'G' && data?.invitation?.title && (
              <LineDetail label="Evento" value={data?.invitation?.title} />
            )}
            <LineDetail
              label="Fecha de invitación"
              value={getDateStrMes(data?.invitation?.date_event)}
            />
            {data?.invitation?.obs && (
              <LineDetail label="Descripción" value={data?.invitation?.obs} />
            )}
          </>
        )}
        {data?.type === 'P' && (
          <LineDetail label="Conductor" value={getFullName(data?.visit)} />
        )}
        {data?.plate && !data?.taxi && (
          <LineDetail label="Placa" value={data?.plate} />
        )}
        <LineDetail
          label={data?.in_at && data?.out_at ? 'Visitó a' : 'Visita a'}
          value={getFullName(data?.owner)}
        />
        {status === 'Denegado' && (
          <>
            <LineDetail
              label="Fecha de denegación"
              value={getDateStrMes(data?.confirm_at)}
            />
            <LineDetail label="Motivo" value={data?.obs_confirm} />
          </>
        )}
        {data?.out_at ? (
          <>
            <LineDetail
              label="Guardia de entrada"
              value={getFullName(data?.guardia)}
            />
            {data?.out_guard && data?.guardia?.id !== data?.out_guard?.id && (
              <LineDetail
                label="Guardia de salida"
                value={getFullName(data?.out_guard)}
              />
            )}
            {data?.obs_guard && (
              <LineDetail label="Obs. de solicitud" value={data?.obs_guard} />
            )}
            {data?.obs_in && (
              <LineDetail label="Obs. de entrada" value={data?.obs_in} />
            )}
            {data?.obs_out && (
              <LineDetail label="Obs. de salida" value={data?.obs_out} />
            )}
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
      </>
    );
  };

  const getCheckVisit = (visit: any, isSelected: boolean) => {
    const status = getStatus(visit);

    if (status == 'S')
      return <Text style={{color: cssVar.cWhite}}>Sin confirmar</Text>;
    if (status == 'N')
      return <Text style={{color: cssVar.cError}}>No Autorizado</Text>;
    if (status == 'C') return null;

    return (
      <Icon
        name={isSelected ? IconCheck : IconCheckOff}
        color={isSelected ? cssVar.cSuccess : 'transparent'}
        fillStroke={isSelected ? undefined : 'white'}
        onPress={() =>
          setAcompSelect({
            ...acompanSelect,
            [visit?.id]: !acompanSelect[visit?.id],

          })
        }
      />
    );
  };

  const detailVisit = (data: any) => {
    const isSelected = acompanSelect[data?.id || '0'];
    return (
      <ItemList
        key={data?.visit?.id}
        title={getFullName(data?.visit)}
        subtitle={'C.I. ' + data?.visit?.ci}
        left={<Avatar name={getFullName(data?.visit)} />}
        right={getCheckVisit(data, isSelected)}
        date={<ItemListDate inDate={data?.in_at} outDate={data?.out_at} />}
      />
    );
  };

  const detailCompanions = () => {
    if (data?.accesses?.length == 0) return null;
    return (
      <>
        <Text style={{color: cssVar.cWhite, marginVertical: 10}}>Visitas</Text>
        <List data={data?.accesses} renderItem={detailVisit} />
      </>
    );
  };

  const getObs = () => {
    const status = getStatus();
    if (status == 'Y')
      return (
        <TextArea
          label="Observaciones de Entrada"
          name="obs_in"
          value={formState?.obs_in}
          onChange={(e:any) => handleInputChange('obs_in', e)}
        />
      );
    if (status == 'I')
      return (
        <TextArea
          label="Observaciones de Salida"
          name="obs_out"
          value={formState?.obs_out}
          onChange={(e:any) => handleInputChange('obs_out', e)}
        />
      );
    return null;
  };

  return (
    <ModalFull
      onClose={close}
      open={open}
      title={'Detalle'}
      onSave={handleSave}
      // buttonCancel={getStatus() === 'C' ? '' : 'cancelar'}
      buttonText={getButtonText()}>
      <Card>
        {cardDetail()}
        {/* visita */}
        {detailVisit(data)}
        {/* Lista de acompañantes */}
        {detailCompanions()}
        {/* Mostrar textarea según la acción (botón) */}
        {getObs()}
      </Card>
    </ModalFull>
  );
};

const styles = StyleSheet.create({
  // Definiciones básicas
  label: {
    color: cssVar.cWhiteV2,
    fontSize: 12,
    fontFamily: FONTS.light,
  },
});

export default DetAccesses;
