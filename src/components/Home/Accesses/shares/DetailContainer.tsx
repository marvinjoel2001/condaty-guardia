// DetailContainer.tsx
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { ItemList } from '../../../../../mk/components/ui/ItemList/ItemList';
import List from '../../../../../mk/components/ui/List/List';
import { getFullName } from '../../../../../mk/utils/strings';
import { cssVar, FONTS } from '../../../../../mk/styles/themes';
import Avatar from '../../../../../mk/components/ui/Avatar/Avatar';
import { TextArea } from '../../../../../mk/components/forms/TextArea/TextArea';
import ItemInfo from '../../../../../mk/components/ui/ItemInfo/ItemInfo';
import useAuth from '../../../../../mk/hooks/useAuth';
import useApi from '../../../../../mk/hooks/useApi';
import Icon from '../../../../../mk/components/ui/Icon/Icon';
import { getDateStrMes, getDateTimeStrMes } from '../../../../../mk/utils/dates';
import { IconCheck, IconCheckOff } from '../../../../icons/IconLibrary';
import ItemListDate from './ItemListDate';


interface DetailProps {
  data: any;
  edit?: boolean;
  onChange: (name: string, value: string) => void;
}


export const AccessDetail: React.FC<DetailProps> = ({ data, edit, onChange }) => {
  const textAreaName = data?.accesses ? 'obs_out' : 'obs_in';
  return (
    <>
      <Text style={styles.label}>Visitante</Text>
      <TouchableOpacity onPress={() => { /* Lógica de selección si es necesaria */ }}>
        <ItemList
          title={getFullName(data?.visit)}
          subtitle={'C.I. ' + data?.visit?.ci}
          style={{ backgroundColor: cssVar.cBlackV1 }}
          left={<Avatar name={getFullName(data?.visit)} />}
        />
      </TouchableOpacity>
      {edit && (
        <TextArea
          label={data?.accesses ? 'Observaciones de Salida' : 'Observaciones de Entrada'}
          name={textAreaName}
          value={data?.accesses ? data?.obs_out : data?.obs_in}
          onChange={(e) => onChange(textAreaName, e.target.value)}
          style={{ backgroundColor: cssVar.cBlack }}
        />
      )}
    </>
  );
};

//
// (Opcional) Componente para el detalle de "Pedidos"
//
export const OrderDetail: React.FC<DetailProps> = ({ data, edit, onChange }) => {
  return (
    <>
      <Text style={styles.label}>Pedido</Text>
      <ItemList
        title={getFullName(data?.client)}
        subtitle={'C.I. ' + data?.client?.ci}
        style={{ backgroundColor: cssVar.cBlackV1 }}
        left={<Avatar name={getFullName(data?.client)} />}
      />
      {edit && (
        <TextArea
          label="Observaciones del Pedido"
          name="obs_order"
          value={data?.obs_order}
          onChange={(e) => onChange('obs_order', e.target.value)}
          style={{ backgroundColor: cssVar.cBlack }}
        />
      )}
    </>
  );
};

//
// (Opcional) Componente para el detalle de "Pendientes"
//
export const PendingDetail: React.FC<DetailProps> = ({ data, edit, onChange }) => {
  return (
    <>
      <Text style={styles.label}>Pendiente</Text>
      <ItemList
        title={data?.task}
        subtitle={'Prioridad: ' + data?.priority}
        style={{ backgroundColor: cssVar.cBlackV1 }}
      />
      {edit && (
        <TextArea
          label="Observaciones"
          name="obs_pending"
          value={data?.obs_pending}
          onChange={(e) => onChange('obs_pending', e.target.value)}
          style={{ backgroundColor: cssVar.cBlack }}
        />
      )}
    </>
  );
};

//
// Contenedor genérico que se encarga de la carga de datos, armado del detalle y lógica común
//
interface DetailContainerProps {
  open: boolean;
  close: () => void;
  id: any;
  reload: () => void;
  edit?: boolean;
  // Se recibe el componente detalle a renderizar
  detailComponent: React.FC<DetailProps>;
  // Identifica el tipo: 'accesos', 'pedidos' o 'pendientes'
  type: 'accesos' | 'pedidos' | 'pendientes';
  screenParams?: any;
}

const DetailContainer: React.FC<DetailContainerProps> = ({
  open,
  close,
  id,
  reload,
  edit,
  detailComponent: DetailComponent,
  type,
  screenParams,
}) => {
  const [data, setData] = useState<any>([]);
  const { showToast } = useAuth();
  const { execute, waiting } = useApi();

  // Estado para el manejo de selección de acompañantes
  const [acompSelect, setAcompSelect] = useState<any[]>([]);

  // Helper para obtener el identificador único del acompañante
  const getCompanionId = (companion: any) => {
    return companion.id || companion.visit?.id;
  };

  // Función para obtener datos del API según el tipo
  const getData = async (id: number) => {
    let endpoint = '';
    let fullType = '';
    switch (type) {
      case 'accesos':
        endpoint = '/accesses';
        fullType = 'DET';
        break;
      case 'pedidos':
        endpoint = '/orders';
        fullType = 'DET';
        break;
      case 'pendientes':
        endpoint = '/pending';
        fullType = 'DET';
        break;
    }
    const { data: responseData, error } = await execute(
      endpoint,
      'GET',
      { fullType, searchBy: id },
      false,
      3
    );
    if (responseData?.success) {
      setData(responseData.data);
    } else {
      showToast(responseData?.message, 'error');
      console.log('Error:', error);
    }
  };

  useEffect(() => {
    if (open) {
      getData(id);
      // Reinicia la selección cuando se abre el detalle
      setAcompSelect([]);
    }
  }, [id, open]);

  // Manejo de cambios en los campos del detalle
  const handleInputChange = (name: string, value: string) => {
    setData({ ...data, [name]: value });
  };

  // Diferenciación de acciones: onIn y onOut
  const onIn = async () => {
    const payload = { id: data?.id, obs_in: data?.obs_in };
    const { data: result, error } = await execute('/accesses/enter', 'POST', payload);
    if (result?.success) {
      reload();
      close();
      showToast('El visitante ingresó', 'success');
    } else {
      showToast(error, 'error');
    }
  };

  const onOut = async () => {
    // Si no se selecciona ningún acompañante, se añade el visitante principal
    const idAcom =
      acompSelect.length > 0 ? acompSelect.map((acom: any) => acom.id) : [data[0]?.id];
    if (idAcom.length === 0) {
      showToast('No hay elementos seleccionados para salir', 'warning');
      return;
    }
    const payload = { ids: idAcom, obs_out: data?.obs_out };
    const { data: result, error } = await execute('/accesses/exit', 'POST', payload, false, 3);
    if (result?.success) {
      reload();
      close();
      setAcompSelect([]);
      showToast('El visitante salió', 'success');
    } else {
      showToast(error, 'error');
    }
  };

  // Función que decide qué acción ejecutar en base al botón
  const handleSave = async () => {
    const assembledDetail =
      data && data.length > 0 ? assembleDetail(data[0], !!edit) : { buttonText: '' };
    if (assembledDetail.buttonText === "Dejar entrar") {
      await onIn();
    } else if (assembledDetail.buttonText === "Dejar salir") {
      await onOut();
    } else {
      showToast('No hay acción definida', 'info');
    }
  };

  // Función mejorada que arma el objeto de detalles para ItemInfo
  const assembleDetail = (item: any, edit: boolean) => {
    const hasActiveAccess =
      (item?.in_at && !item?.out_at) ||
      (item?.accesses && item.accesses.some((acon: any) => acon.in_at && !acon.out_at));

    const details: any[] = [];
    let status = "";
    let buttonText = "";

    if (item?.type === "O") {
      details.push(
        { l: "Tipo de acceso", v: "QR Llave Virtual" },
        { l: "Fecha de ingreso", v: getDateTimeStrMes(item?.in_at) },
        { l: "Residente", v: getFullName(item?.owner) },
        { l: "Guardia de entrada", v: getFullName(item?.guardia) }
      );
    } else {
      status = item?.out_at
        ? "Completado"
        : !item?.confirm_at
        ? "Por confirmar"
        : item?.in_at
        ? "Por Salir"
        : item?.confirm === "Y"
        ? "Por Entrar"
        : "Denegado";

      details.push({
        l: "Estado",
        v: status,
        sv: { color: status === "Denegado" ? cssVar.cError : cssVar.cWhite },
      });
      details.push({
        l: "Tipo de acceso",
        v:
          item?.type === "P"
            ? "Pedido-" + item?.other?.other_type.name
            : item?.type === "I"
            ? "QR Individual"
            : item?.type === "C"
            ? "Sin QR"
            : item?.type === "G"
            ? "QR Grupal"
            : "QR Llave Virtual",
      });
      if ((item?.type === "I" || item?.type === "G") && item?.invitation) {
        if (item?.type === "G" && item?.invitation?.title) {
          details.push({ l: "Evento", v: item?.invitation?.title });
        }
        details.push({ l: "Fecha de invitación", v: getDateStrMes(item?.invitation?.date_event) });
        if (item?.invitation?.obs) {
          details.push({ l: "Descripción", v: item?.invitation?.obs });
        }
      }
      if (item?.type === "P") {
        details.push({ l: "Conductor", v: getFullName(item?.visit) });
      }
      if (item?.plate && !item?.taxi) {
        details.push({ l: "Placa", v: item?.plate });
      }
      details.push({
        l: item?.in_at && item?.out_at ? "Visitó a" : "Visita a",
        v: getFullName(item?.owner),
      });
      if (status === "Denegado") {
        details.push({ l: "Fecha de denegación", v: getDateStrMes(item?.confirm_at) });
        details.push({ l: "Motivo", v: item?.obs_confirm });
      }
      if (item?.out_at) {
        details.push({ l: "Guardia de entrada", v: getFullName(item?.guardia) });
        if (item?.out_guard && item?.guardia?.id !== item?.out_guard?.id) {
          details.push({ l: "Guardia de salida", v: getFullName(item?.out_guard) });
        }
        if (item?.obs_guard) {
          details.push({ l: "Obs. de solicitud", v: item?.obs_guard });
        }
        if (item?.obs_in) {
          details.push({ l: "Obs. de entrada", v: item?.obs_in });
        }
        if (item?.obs_out) {
          details.push({ l: "Obs. de salida", v: item?.obs_out });
        }
      } else {
        if (item?.obs_in) {
          details.push({ l: "Obs. de entrada", v: item?.obs_in });
        } else if (item?.obs_out) {
          details.push({ l: "Obs. de salida", v: item?.obs_out });
        }
      }
      if (edit) {
        buttonText = hasActiveAccess
          ? "Dejar salir"
          : (item?.confirm_at && item?.confirm === "Y" && !item?.in_at ? "Dejar entrar" : "");
      }
    }

    return {
      title: "Detalle de acceso",
      data: details,
      buttonText,
      buttonCancel: "",
    };
  };

  const assembledDetail =
    data && data.length > 0 ? assembleDetail(data[0], !!edit) : { title: '', data: [] };

  // Función para gestionar la selección de acompañantes usando el helper
  const handleSelectAcomp = (companion: any) => {
    const id = getCompanionId(companion);
    const isSelected = acompSelect.some((a: any) => a.id === id);
    if (isSelected) {
      setAcompSelect(acompSelect.filter((a: any) => a.id !== id));
    } else {
      setAcompSelect([...acompSelect, { id }]);
    }
  };

  // Componente para renderizar el icono de selección
  const RightItem = ({ companion, isSelected }: { companion: any; isSelected: boolean }) => {
    console.log(!companion?.out_at && companion?.in_at,'condicion')
    if (!companion?.out_at && companion?.in_at) {
      return (
        <Icon
          name={isSelected ? IconCheck : IconCheckOff}
          color={isSelected ? cssVar.cSuccess : 'transparent'}
        />
      );
    }
    return null;
  };

  // Función para renderizar cada acompañante
  const renderCompanion = (companion: any) => {
    const id = getCompanionId(companion);
    const isSelected = acompSelect.some((a: any) => a.id === id);
    return (
      <TouchableOpacity key={id} onPress={() => handleSelectAcomp(companion)}>
        <ItemList
          title={getFullName(companion?.visit)}
          subtitle={`C.I. ${companion?.visit?.ci}`}
          left={<Avatar name={getFullName(companion?.visit)} />}
          right={<RightItem companion={companion} isSelected={isSelected} />}
          date={<ItemListDate inDate={companion?.in_at} outDate={companion?.out_at} />}
          style={{ backgroundColor: cssVar.cBlackV1 }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <ItemInfo details={assembledDetail} onSave={handleSave} onClose={close} open={open}>
      {waiting > 0 ? (
        <ActivityIndicator style={{ height: 220 }} color={cssVar.cSuccess} size="large" />
      ) : (
        <>
          {/* Renderiza el detalle específico */}
          <DetailComponent data={data[0]} edit={edit} onChange={handleInputChange} />
          {/* Si es de tipo 'accesos' y existen acompañantes, se renderiza la lista de selección */}
          {type === 'accesos' && data[0]?.accesses && data[0].accesses.length > 0 && (
            <List data={data[0].accesses} renderItem={renderCompanion} />
          )}
        </>
      )}
    </ItemInfo>
  );
};

const styles = StyleSheet.create({
  label: {
    color: cssVar.cWhiteV2,
    fontSize: 12,
    fontFamily: FONTS.light,
  },
});

export default DetailContainer;
