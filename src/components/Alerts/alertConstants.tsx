import {cssVar} from '../../../mk/styles/themes';
import {
  IconAlert,
  IconAmbulance,
  IconFlame,
  IconTheft,
} from '../../icons/IconLibrary';

// CONSTANTES PRINCIPALES - CAMBIAR AQUÍ PARA AFECTAR TODO
export const ALERT_LEVEL_LABELS = {
  1: 'bajisimo',
  2: 'medio',
  3: 'alto',
  4: 'pánico'
};

export const EMERGENCY_TYPE_LABELS = {
  E: 'Emergencia Médica',
  F: 'Incendio',
  T: 'Robo',
  O: 'Otro'
};

// Array para compatibilidad con código existente (se genera automáticamente)
export const levelAlerts = ['', ...Object.values(ALERT_LEVEL_LABELS)];

// Agregar esta constante que faltaba
export const ALERT_LEVELS = ALERT_LEVEL_LABELS;

// Colores por nivel de alerta (usa las etiquetas dinámicamente)
export const ALERT_LEVEL_COLORS = {
  1: {
    color: cssVar.cSuccess,
    background: cssVar.cHoverSuccess,
    label: `Nivel ${ALERT_LEVEL_LABELS[1]}`
  },
  2: {
    color: cssVar.cWarning,
    background: cssVar.cHoverWarning,
    label: `Nivel ${ALERT_LEVEL_LABELS[2]}`
  },
  3: {
    color: cssVar.cError,
    background: cssVar.cHoverError,
    label: `Nivel ${ALERT_LEVEL_LABELS[3]}`
  },
  4: {
    color: cssVar.cError,
    background: cssVar.cHoverError,
    label: `Nivel ${ALERT_LEVEL_LABELS[4]}`
  }
};

// Para compatibilidad con código existente
export const statusColor = ALERT_LEVEL_COLORS;

// Tipos de emergencia (usa las etiquetas dinámicamente)
export const EMERGENCY_TYPES = {
  E: {
    name: EMERGENCY_TYPE_LABELS.E,
    icon: IconAmbulance,
    border: cssVar.cError,
    background: cssVar.cHoverError
  },
  F: {
    name: EMERGENCY_TYPE_LABELS.F,
    icon: IconFlame,
    border: cssVar.cWarning,
    background: cssVar.cHoverWarning
  },
  T: {
    name: EMERGENCY_TYPE_LABELS.T,
    icon: IconTheft,
    border: cssVar.cAlertMedio,
    background: cssVar.cHoverOrange
  },
  O: {
    name: EMERGENCY_TYPE_LABELS.O,
    icon: IconAlert,
    border: cssVar.cCompl4,
    background: cssVar.cHoverCompl4
  }
};

// Para compatibilidad con código existente
export const statusColorPanic = {
  E: {border: EMERGENCY_TYPES.E.border, background: EMERGENCY_TYPES.E.background},
  F: {border: EMERGENCY_TYPES.F.border, background: EMERGENCY_TYPES.F.background},
  T: {border: EMERGENCY_TYPES.T.border, background: EMERGENCY_TYPES.T.background},
  O: {border: EMERGENCY_TYPES.O.border, background: EMERGENCY_TYPES.O.background}
};

// Para LockAlert (formato diferente, usa las constantes principales)
export const typeAlerts = {
  E: {
    name: EMERGENCY_TYPES.E.name,
    icon: EMERGENCY_TYPES.E.icon,
    color: {background: EMERGENCY_TYPES.E.background, border: EMERGENCY_TYPES.E.border}
  },
  F: {
    name: EMERGENCY_TYPES.F.name,
    icon: EMERGENCY_TYPES.F.icon,
    color: {background: EMERGENCY_TYPES.F.background, border: EMERGENCY_TYPES.F.border}
  },
  T: {
    name: EMERGENCY_TYPES.T.name,
    icon: EMERGENCY_TYPES.T.icon,
    color: {background: EMERGENCY_TYPES.T.background, border: EMERGENCY_TYPES.T.border}
  },
  O: {
    name: EMERGENCY_TYPES.O.name,
    icon: EMERGENCY_TYPES.O.icon,
    color: {background: EMERGENCY_TYPES.O.background, border: EMERGENCY_TYPES.O.border}
  }
};

// Opciones para el selector de nivel en AlertAdd (se genera automáticamente)
export const ALERT_LEVEL_OPTIONS = Object.entries(ALERT_LEVEL_LABELS)
  .filter(([key]) => key !== '4') // Excluir pánico del selector
  .map(([value, label]) => ({
    value: parseInt(value),
    label: label
  }));

// Tabs para el componente Alerts (se genera automáticamente)
export const ALERT_TABS = [
  {value: 'T', text: 'Todas'},
  {value: 'NA', text: `Nivel ${ALERT_LEVEL_LABELS[3]}`},
  {value: 'NM', text: `Nivel ${ALERT_LEVEL_LABELS[2]}`},
  {value: 'NB', text: `Nivel ${ALERT_LEVEL_LABELS[1]}`},
  {value: 'P', text: `Nivel ${ALERT_LEVEL_LABELS[4]}`},
];
