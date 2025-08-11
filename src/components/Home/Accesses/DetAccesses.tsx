// DetAccesses.tsx
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import Card from '../../../../mk/components/ui/Card/Card';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import useApi from '../../../../mk/hooks/useApi';
import {getAccessType} from '../../../../mk/utils/utils';
import {getDateTimeStrMes} from '../../../../mk/utils/dates';
import {getFullName, getUrlImages} from '../../../../mk/utils/strings';
import {TextArea} from '../../../../mk/components/forms/TextArea/TextArea';
import {ItemList} from '../../../../mk/components/ui/ItemList/ItemList';
import Avatar from '../../../../mk/components/ui/Avatar/Avatar';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconCheck, IconCheckOff, IconExpand} from '../../../icons/IconLibrary';
import useAuth from '../../../../mk/hooks/useAuth';
import Loading from '../../../../mk/components/ui/Loading/Loading';
import KeyValue from '../../../../mk/components/ui/KeyValue';
import ModalAccessExpand from './ModalAccessExpand';

const statusColor: any = {
  I: cssVar.cAlertMedio,
  Y: cssVar.cSuccess,
  N: cssVar.cError,
  S: cssVar.cSuccess,
  C: cssVar.cSuccess,
};

const DetAccesses = ({id, open, close, reload}: any) => {
  const {showToast} = useAuth();
  const {execute, waiting} = useApi();
  const [data, setData]: any = useState(null);
  const [acompanSelect, setAcompSelect]: any = useState([]);
  const [formState, setFormState]: any = useState({});
  const [openDet, setOpenDet]: any = useState({
    open: false,
    id: null,
    type: '',
    invitation: null,
  });
  const getData = async (id: number) => {
    try {
      const {data} = await execute('/accesses', 'GET', {
        fullType: 'DET',
        searchBy: id,
      });

      if (data.success && data.data.length > 0) {
        // If there's a linked access_id, use that instead of the current data
        const accessData = data.data[0];
        if (accessData.access_id) {
          const {data: linkedData} = await execute('/accesses', 'GET', {
            fullType: 'DET',
            searchBy: accessData.access_id,
          });

          if (linkedData.success && linkedData.data.length > 0) {
            setData(linkedData.data[0]);
          }
        } else {
          setData(accessData);
        }
      }
    } catch (error) {
      console.error('Error fetching access data:', error);
    }
  };

  useEffect(() => {
    if (id) {
      getData(id);
    }
  }, [id]);
  console.log(data?.accesses?.length, 'data dataaaa');
  const handleSave = async () => {
    const status = getStatus();
    if (status === 'C') {
      // Si está completado, significa que todos han salido
      close();
      return;
    }
    if (status === 'I') {
      let ids = [];
      if (
        Object.values(acompanSelect).every(value => !value) &&
        data?.accesses?.length > 0
      ) {
        showToast('Debe seleccionar para dejar salir', 'error');
        return;
      }
      // const ids = acompanSelect.map((item: any) => item.id);
      if (data?.accesses?.length > 0) {
        ids = Object.keys(acompanSelect)
          .filter(id => acompanSelect[id])
          .map(id => Number(id));
      } else {
        ids.push(data?.id);
      }

      // console.log(ids,'idsss')
      const {data: result, error} = await execute(
        '/accesses/exit',
        'POST',
        {
          ids,
          obs_out: formState?.obs_out || '',
        },
        false,
        3,
      );
      if (result?.success) {
        if (reload) reload();
        close();
        showToast('El visitante salió', 'success');
      } else {
        console.log('Error en dejar salir:', error);
        showToast('Error al dejar salir', 'error');
      }
    } else {
      const {data: result, error} = await execute('/accesses/enter', 'POST', {
        id: data?.id,
        obs_in: formState?.obs_in || '',
      });
      if (result?.success) {
        if (reload) reload();
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

    // Verificar si el visitante principal y todos los acompañantes han salido
    if (_data?.out_at) {
      // Si no hay acompañantes, está completado
      if (!_data?.accesses || _data.accesses.length === 0) return 'C';

      // Verificar que todos los acompañantes hayan salido
      const todosHanSalido = _data.accesses.every((acomp: any) => acomp.out_at);
      return todosHanSalido ? 'C' : 'I';
    }
    return '';
  };
  const status = getStatus();

  let accessType = getAccessType(data);

  // Actualiza formState para las observaciones
  const handleInputChange = (name: string, value: string) => {
    setFormState({...formState, [name]: value});
  };

  const getButtonText = () => {
    const status = getStatus();
    const buttonTexts: Record<string, string> = {
      I: 'Dejar salir',
      Y: 'Dejar ingresar',
      S: '',
      C: '',
    };
    return buttonTexts[status] || '';
  };
  const getStatusText = () => {
    const status = getStatus();
    const statusTexts: Record<string, string> = {
      I: 'Dejar salir',
      Y: 'Dejar ingresar',
      N: 'Rechazado',
      S: 'Esperando aprobación',
      C: 'Completado',
    };
    return statusTexts[status] || '';
  };

  const statusText = getStatusText();

  const cardDetail = () => {
    const status = getStatus();
    console.log("mi data", data)
    return (
      <Card>
        <Text style={styles.labelAccess}>
            {status === 'I'
              ? 'Visitó a'
              : status === 'N'
              ? 'Residente'
              : 'Visita a'}
        </Text>
        <ItemList
          title={getFullName(data?.owner)}
          // subtitle={'C.I.' + data?.owner?.ci}
          subtitle={
            'Unidad: ' +
            data?.owner?.dptos?.[0]?.nro +
            ', ' +
            data?.owner?.dptos?.[0]?.description
          }
          left={
            <Avatar
              name={getFullName(data?.owner)}
              src={getUrlImages(
                '/OWNER-' +
                  data?.owner?.id +
                  '.webp?d=' +
                  data?.owner?.updated_at,
              )}
            />
          }
          right={
            data?.type !== 'C' ? (
              <Icon
                name={IconExpand}
                color={cssVar.cWhiteV1}
                onPress={() =>
                  setOpenDet({
                    open: true,
                    id: data?.invitation_id,
                    invitation: {...data?.invitation, owner: data?.owner},
                    type: 'I',
                  })
                }
              />
            ) : null
          }
        />
        {data?.confirm == 'N' && data?.obs_confirm && (
          <KeyValue keys="Motivo del rechazo" value={data?.obs_confirm} />
        )}
        <Br />
        {detailVisit(data)}

      </Card>
    );
  };
  const Br = () => {
    return (
      <View
        style={{
          height: 0.5,
          backgroundColor: cssVar.cWhiteV1,
          marginVertical: 8,
          width: '100%',
        }}
      />
    );
  };
  const getCheckVisit = (
    visit: any,
    isSelected: boolean,
    type: 'A' | 'T' | 'I',
  ) => {
    const status = getStatus(visit);

    // if (status == 'S')
    // return (
    //   <Text style={{color: cssVar.cWhite, fontSize: 10}}>
    //     Esperando aprobación
    //   </Text>
    // );
    // if (status == 'N')
    // return (
    //   <Text style={{color: cssVar.cError, fontSize: 10}}>Rechazado</Text>
    // );
    if (status == 'C') {
      return (
        <Icon
          name={IconExpand}
          onPress={() =>
            setOpenDet({
              open: true,
              // id: type == 'I' ? visit?.invitation_id : visit?.id,
              id: visit?.id,
              type: type,
            })
          }
          color={cssVar.cWhiteV1}
        />
      );
    }
    if (status == 'S' || status == 'N') return null;

    return (
      <Icon
        name={isSelected ? IconCheck : IconCheckOff}
        color={isSelected ? cssVar.cAccent : 'transparent'}
        fillStroke={isSelected ? 'transparent' : cssVar.cWhiteV1}
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
    console.log("Mi data - 1" , data)
    let visit = data.visit ? data.visit : data.owner;

    const isSelected = acompanSelect[data?.id || '0'];
    const acompData = data?.accesses.filter((item: any) => item.taxi != 'C');
    const taxi = data?.accesses.filter((item: any) => item.taxi == 'C');
    return (
      <View>
        <Text style={styles.labelAccess}>Visitante</Text>
        <ItemList
          key={data?.visit?.id}
          title={getFullName(visit)}
          subtitle={'C.I: ' + visit?.ci + (data?.plate && taxi?.length === 0 ? ' - Placa: ' + data?.plate : '')}
          left={<Avatar name={getFullName(visit)} />}
          right={
            data?.out_at || status === 'Y' || data?.accesses?.length == 0
              ? null
              : getCheckVisit(data, isSelected, 'I')
          }
          // date={<ItemListDate inDate={data?.in_at} outDate={data?.out_at} />}
        />
        {/* <KeyValue keys="Tipo de visita" value={accessType} /> */}
        {/* <KeyValue
          keys="Estado"
          value={statusText}
          colorValue={statusColor[getStatus()]}
        /> */}
        {/* {data?.confirm == 'N' && data?.obs_confirm && (
          <KeyValue keys="Motivo del rechazo" value={data?.obs_confirm} />
        )} */}
        {data?.in_at && (
          <>
            <KeyValue
              keys="Fecha y hora de ingreso"
              value={getDateTimeStrMes(data?.in_at)}
            />
            <KeyValue
              keys={
                !data?.out_guard && !data?.out_at
                  ? 'Guardia de ingreso'
                  : 'Guardia de ingreso y salida'
              }
              value={getFullName(data?.guardia)}
            />

            <KeyValue
              keys="Observación de ingreso"
              value={data?.obs_in || '-/-'}
            />
          </>
        )}
        {data?.out_at && (
          <>
            <KeyValue
              keys="Fecha y hora de salida"
              value={getDateTimeStrMes(data?.out_at, true)}
            />
            {data?.out_guard && (
              <KeyValue
                keys="Guardia de salida"
                value={getFullName(data?.out_guard)}
              />
            )}
            {/* {data?.obs_out && ( */}
            <KeyValue
              keys="Observación de salida"
              value={data?.obs_out || '-/-'}
            />
            {/* )} */}
          </>
        )}
        {acompData?.length > 0 && (
          <>
            <Br />
            <Text style={styles.labelAccess}>Acompañantes</Text>
            {acompData.map((item: any) => (
              <ItemList
                key={item?.id}
                title={getFullName(item?.visit)}
                subtitle={'C.I:' + item?.visit?.ci}
                left={<Avatar name={getFullName(item?.visit)} />}
                right={
                  status === 'Y'
                    ? null
                    : getCheckVisit(item, acompanSelect[item?.id || '0'], 'A')
                }
                // date={<ItemListDate inDate={item?.in_at} outDate={item?.out_at} />}
              />
            ))}
          </>
        )}
        {taxi?.length > 0 && (
          <>
            <Br />
            <Text style={styles.labelAccess}>Taxista</Text>
            {taxi.map((item: any) => (
              <ItemList
                key={item?.id}
                title={getFullName(item?.visit)}
                subtitle={'C.I:' + item?.visit?.ci + ' - ' + 'Placa: '+item?.plate}
                left={<Avatar name={getFullName(item?.visit)} />}
                right={
                  status === 'Y'
                    ? null
                    : getCheckVisit(item, acompanSelect[item?.id || '0'], 'T')
                }
                // date={<ItemListDate inDate={item?.in_at} outDate={item?.out_at} />}
              />
            ))}
          </>
        )}
      </View>
    );
  };

  const getObs = () => {
    const status = getStatus();
    if (status == 'Y')
      return (
        <TextArea
          label="Observaciones de entrada"
          name="obs_in"
          value={formState?.obs_in}
          onChange={(e: any) => handleInputChange('obs_in', e)}
          placeholder='Ej: El visitante está ingresando con 2 mascotas'
        />
      );
    if (status == 'I')
      return (
        <TextArea
          label="Observaciones de salida"
          name="obs_out"
          value={formState?.obs_out}
          onChange={(e: any) => handleInputChange('obs_out', e)}
        />
      );
    return null;
  };
  return (
    <ModalFull
      onClose={() => close()}
      open={open}
      title={'Visitante sin QR'}
      onSave={handleSave}
      // buttonCancel={getStatus() === 'C' ? '' : 'cancelar'}
      buttonText={getButtonText()}>
      {!data ? (
        <Loading />
      ) : (
        <>
          {cardDetail()}

          {/* {detailVisit(data)} */}

          {getObs()}
        </>
      )}
      {openDet.open && (
        <ModalAccessExpand
          open={openDet.open}
          type={openDet.type}
          invitation={openDet.invitation}
          id={openDet.id}
          onClose={() =>
            setOpenDet({open: false, id: null, type: '', invitation: null})
          }
        />
      )}
    </ModalFull>
  );
};

const styles = StyleSheet.create({
  // Definiciones básicas
  label: {
    color: cssVar.cWhiteV1,
    fontSize: 12,
    fontFamily: FONTS.light,
  },
  labelAccess: {
    color: cssVar.cWhite,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
});

export default DetAccesses;
