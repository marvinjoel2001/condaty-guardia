// DetAccesses.tsx
import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text } from 'react-native';
import ModalFull from '../../../../mk/components/ui/ModalFull/ModalFull';
import Card from '../../../../mk/components/ui/Card/Card';
import { cssVar, FONTS } from '../../../../mk/styles/themes';
import LineDetail from './shares/LineDetail';
import useApi from '../../../../mk/hooks/useApi';
import { getAccessStatus, getAccessType } from '../../../../mk/utils/utils';
import { getDateStrMes } from '../../../../mk/utils/dates';
import { getFullName } from '../../../../mk/utils/strings';
import List from '../../../../mk/components/ui/List/List';
import CompanionCheckItem from './shares/CompanionCheckItem';
import { TextArea } from '../../../../mk/components/forms/TextArea/TextArea';
import { ThemeContext } from '../../../../mk/contexts/ThemeContext';

const DetAccesses = ({ id, open, close, reload }: any) => {
  const { execute, waiting } = useApi();
  const [data, setData]: any = useState(null);
  const [acompanSelect, setAcompSelect]: any = useState([]);
  const [formState, setFormState]:any = useState({}); // estado para obs_in / obs_out
  

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

  // Función dummy para onSave (se puede reemplazar por la lógica real)
  const dummy = (e: string) => {
    console.log('dummy', e);
  };

  // Determina un estado corto ("C": Completado, "I": Ingreso en proceso, "" si no aplica)
  const getStatus = () => {
    if (data?.out_at) return 'C';
    if (data?.in_at && !data?.out_at) return 'I';
    return '';
  };

  let status = getAccessStatus(data);
  let accessType = getAccessType(data);

  // Función para alternar la selección de un acompañante
  const handleSelectAcomp = (id: number) => {
    const isSelected = acompanSelect.some((a: any) => a.id === id);
    if (isSelected) {
      setAcompSelect(acompanSelect.filter((a: any) => a.id !== id));
    } else {
      setAcompSelect([...acompanSelect, { id }]);
    }
  };

  // Función para armar la información de acción (buttonText) según la data
  const assembleDetail = (item: any) => {
    let buttonText = "";
    // Si ya salió, no se muestra acción
    if (item.out_at) {
      buttonText = "";
    } else if (item.in_at) {
      buttonText = "Dejar salir";
    } else if (!item.in_at && item.confirm_at && item.confirm === "Y") {
      buttonText = "Dejar entrar";
    }
    return { buttonText };
  };

  const assembledDetail = data ? assembleDetail(data) : { buttonText: "" };

  // Actualiza formState para las observaciones
  const handleInputChange = (name: string, value: string) => {
    setFormState({ ...formState, [name]: value });
  };

  // Renderiza cada acompañante (suponiendo que companion.id o companion.visit.id es el identificador)
  const renderCompanion = (companion: any) => {
    const compId = companion.id || companion.visit?.id;
    const isSelected = acompanSelect.some((a: any) => a.id === compId);
    return (
      <CompanionCheckItem
        key={compId}
        companion={companion}
        isSelected={isSelected}
        onToggle={handleSelectAcomp}
      />
    );
  };

  const handleSave = async () => {
    const status = getStatus(); 
    if (status === 'I') {
      if (acompanSelect.length === 0) {
        console.log("Debe seleccionar al menos un acompañante para dejar salir");
        return;
      }
      const ids = acompanSelect.map((item: any) => item.id);
      const { data: result, error } = await execute('/accesses/exit', 'POST', {
        ids,
        obs_out: formState?.obs_out || ""
      });
      if (result?.success) {
        reload();
        close();
      } else {
        console.log("Error en dejar salir:", error);
      }
    } else {
      const { data: result, error } = await execute('/accesses/enter', 'POST', {
        id: data?.id,
        obs_in: formState?.obs_in || ""
      });
      if (result?.success) {
        reload();
        close();
      } else {
        console.log("Error en dejar entrar:", error);
      }
    }
  };
  

  return (
    <ModalFull
      onClose={close}
      open={open}
      title={'Detalle'}
      onSave={handleSave}
      // buttonCancel={getStatus() === 'C' ? '' : 'cancelar'}
      buttonText={getStatus() === 'C' ? '' : (getStatus() === 'I' ? 'Dejar salir' : 'Dejar entrar')}
    >
      <Card>
        <LineDetail label="Estado" value={status} />
        <LineDetail label="Tipo" value={accessType} />
        {(data?.type === "I" || data?.type === "G") && data?.invitation && (
          <>
            {data?.type === "G" && data?.invitation?.title && (
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
        {data?.type === "P" && (
          <LineDetail label="Conductor" value={getFullName(data?.visit)} />
        )}
        {data?.plate && !data?.taxi && (
          <LineDetail label="Placa" value={data?.plate} />
        )}
        <LineDetail
          label={data?.in_at && data?.out_at ? "Visitó a" : "Visita a"}
          value={getFullName(data?.owner)}
        />
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

        {/* Lista de acompañantes */}
        {data?.accesses && assembledDetail?.buttonText !== "" && data?.accesses?.length > 0 && (
          <>
            <Text style={{ color: cssVar.cWhite, marginVertical: 10 }}>
              Visitas
            </Text>
            <List data={data.accesses} renderItem={renderCompanion} />
          </>
        )}

        {/* Mostrar textarea según la acción (botón) */}
        {assembledDetail.buttonText === "Dejar entrar" && (
          <TextArea
            label="Observaciones de Entrada"
            name="obs_in"
            value={formState?.obs_in || ""}
            onChange={(e) => handleInputChange("obs_in", e.target.value)}
          
          />
        )}
        {assembledDetail.buttonText === "Dejar salir" && (
          <TextArea
            label="Observaciones de Salida"
            name="obs_out"
            value={formState?.obs_out || ""}
            onChange={(e) => handleInputChange("obs_out", e.target.value)}
            // style={{ backgroundColor: theme.form?.color }}
          />
        )}
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
