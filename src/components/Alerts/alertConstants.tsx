import {cssVar} from '../../../mk/styles/themes';
import {
  IconAlert,
  IconAmbulance,
  IconFlame,
  IconTheft,
} from '../../icons/IconLibrary';

// CONSTANTES PRINCIPALES - CAMBIAR AQUÍ PARA AFECTAR TODAS LAS ALERTAS
export const ALERT_LEVEL_LABELS = {
  1: 'Para guardias',
  2: 'Para admins y guardias',
  3: 'Para todo el condominio',
  4: 'Emergencia',
};

export const EMERGENCY_TYPE_LABELS = {
  E: 'Emergencia Médica',
  F: 'Incendio',
  T: 'Robo',
  O: 'Otro'
};

// Array para compatibilidad con código existente
export const levelAlerts = ['', ...Object.values(ALERT_LEVEL_LABELS)];

export const ALERT_LEVELS = ALERT_LEVEL_LABELS;

// Colores por nivel de alerta
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

// Tipos de emergencia
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

export const statusColorPanic = {
  E: {border: EMERGENCY_TYPES.E.border, background: EMERGENCY_TYPES.E.background},
  F: {border: EMERGENCY_TYPES.F.border, background: EMERGENCY_TYPES.F.background},
  T: {border: EMERGENCY_TYPES.T.border, background: EMERGENCY_TYPES.T.background},
  O: {border: EMERGENCY_TYPES.O.border, background: EMERGENCY_TYPES.O.background}
};

// Para LockAlert
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

// Opciones para el selector de nivel en AlertAdd
export const ALERT_LEVEL_OPTIONS = Object.entries(ALERT_LEVEL_LABELS)
  .filter(([key]) => key !== '4')
  .map(([value, label]) => ({
    id: parseInt(value),
    name: label
  }));

// Tabs para el componente Alerts
export const ALERT_TABS = [
  {value: 'T', text: 'Todas'},
  {value: 'NA', text: ` ${ALERT_LEVEL_LABELS[3]}`},
  {value: 'NM', text: ` ${ALERT_LEVEL_LABELS[2]}`},
  {value: 'NB', text: ` ${ALERT_LEVEL_LABELS[1]}`},
  {value: 'P', text: ` ${ALERT_LEVEL_LABELS[4]}`},
];
