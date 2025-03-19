import { cssVar } from "../../../../../mk/styles/themes";
import { getDateStrMes, getDateTimeStrMes } from "../../../../../mk/utils/dates";
import { getFullName } from "../../../../../mk/utils/strings";

export const AssembleDetail = (item: any, edit: boolean) => {
    // Verifica si hay al menos un acceso activo (in_at sin out_at)
    const hasActiveAccess =
      (item?.in_at && !item?.out_at) ||
      (item?.accesses && item.accesses.some((acon: any) => acon.in_at && !acon.out_at));
  
    const details: any[] = [];
    let status = "";
    let buttonText = "";
  
    if (item?.type === "O") {
      // Acceso por llave virtual
      details.push(
        { l: "Tipo de acceso", v: "QR Llave Virtual" },
        { l: "Fecha de ingreso", v: getDateTimeStrMes(item?.in_at) },
        { l: "Residente", v: getFullName(item?.owner) },
        { l: "Guardia de entrada", v: getFullName(item?.guardia) }
      );
    } else {
      // Para otros tipos de acceso
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
  
      if (item?.type === "I" || item?.type === "G") {
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
  
      // Determinación del texto del botón de acción según el estado y permisos de edición
      if (edit) {
        buttonText = hasActiveAccess ? "Dejar salir" : item?.confirm_at && item?.confirm === "Y" && !item?.in_at ? "Dejar entrar" : "";
      }
    }
  
    return {
      title: "Detalle de acceso",
      data: details,
      buttonText,
      buttonCancel: "",
    };
  };
  