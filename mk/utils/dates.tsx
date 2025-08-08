export const MONTHS = [
  '',
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export const GMT = -4;

export const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const getDateStr = (dateStr: string | null): string =>
  (dateStr + 'T').split('T')[0];

export const getUTCNow = (dias = 0) => {
  const d = new Date();
  if (dias !== 0) d.setDate(d.getDate() + dias);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // convierte a UTC
  return d.toISOString().slice(0, 19).replace('T', ' ');
};

export const resetTime = (dateStr: any | null) => {
  const newDate = new Date(dateStr);
  newDate.setHours(0, 0, 0, 0); // Resetea las horas, minutos, segundos y milisegundos
  return newDate;
};

export const esFormatoISO8601 = (cadena: string | null) => {
  if (!cadena || cadena === '') return false;
  const regexISO8601 =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?Z?$/;
  return regexISO8601.test(cadena);
};

// Función para convertir una fecha UTC a hora local
export const convertirFechaUTCaLocal = (fechaUTCString: string | null) => {
  if (!fechaUTCString || fechaUTCString === '') return null;
  const fechaUTC = new Date(fechaUTCString);
  const offsetUTC = fechaUTC.getTimezoneOffset();
  const fechaLocal = new Date(fechaUTC.getTime() - offsetUTC * 60000);

  if (offsetUTC === 0) fechaLocal.setHours(fechaLocal.getHours() + GMT);
  return fechaLocal;
};

// Función para obtener la fecha y la hora en un formato específico
// export const getDateTimeStrMes = (
//   dateStr: string | null = '',
//   utc: boolean = false,
// ): string => {
//   if (!dateStr || dateStr === '') return '';

//   let fechaLocal: any;

//   // Convierte la fecha de UTC a la hora local o la toma como es
//   if (esFormatoISO8601(dateStr) || utc) {
//     fechaLocal = convertirFechaUTCaLocal(dateStr);
//   } else {
//     fechaLocal = new Date(dateStr.replace(' ', 'T'));
//   }

//   const diaSemana = DAYS_SHORT[fechaLocal.getDay()];
//   const dia = fechaLocal.getDate();
//   const mes = MONTHS[fechaLocal.getMonth() + 1];

//   // Ajuste para la hora
//   let hora;
//   if (esFormatoISO8601(dateStr)) {
//     hora = fechaLocal.getHours() - GMT;
//   } else {
//     hora = fechaLocal.getHours();
//   }
//   let minutos = fechaLocal.getMinutes();

//   // Si la hora es exactamente las 24:00 horas, se ajusta a las 23:59 horas
//   if (hora === 24 && minutos === 0) {
//     hora = 23;
//     minutos = 59;
//   }

//   // Convertimos la hora y los minutos a un formato de dos dígitos
//   const horaStr = hora.toString().padStart(2, '0');
//   const minutosStr = minutos.toString().padStart(2, '0');

//   return `${diaSemana}, ${dia} ${mes} - ${horaStr}:${minutosStr}`;
// };
export const getDateTimeStrMes = (
  dateStr: string | null = '',
  utc: boolean = true,
): string => {
  if (!dateStr || dateStr === '') return '';

  let fechaLocal: Date | any;

  // Convierte la fecha de UTC a la hora local o la toma como es
  if (esFormatoISO8601(dateStr) || utc) {
    fechaLocal = convertirFechaUTCaLocal(dateStr);
  } else {
    fechaLocal = new Date(dateStr.replace(' ', 'T'));
  }

  const diaSemana = DAYS_SHORT[fechaLocal.getDay()]; // e.g., 'Lun'
  const dia = fechaLocal.getDate(); // 1
  const mes = (fechaLocal.getMonth() + 1).toString().padStart(2, '0'); // 04
  const anio = fechaLocal.getFullYear(); // 2025

  let hora: number = fechaLocal.getHours() - GMT;
  // if (esFormatoISO8601(dateStr)) {
  //   hora = fechaLocal.getHours() - GMT;
  // } else {
  //   hora = fechaLocal.getHours();
  // }
  let minutos = fechaLocal.getMinutes();

  if (hora === 24 && minutos === 0) {
    hora = 23;
    minutos = 59;
  }

  const horaStr = hora.toString().padStart(2, '0');
  const minutosStr = minutos.toString().padStart(2, '0');

  // Formato final: Lun, 1/04/2025 - 15:12
  return `${diaSemana}, ${dia}/${mes}/${anio} - ${horaStr}:${minutosStr}`;
};

export const formatDateToDDMMYY = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2); // Obtener los últimos dos dígitos del año
  return `${day}/${month}/${year}`;
};

// export const getDateStrMes = (
//   dateStr: string | null = '',
//   utc: boolean = false,
// ): string => {
//   if (!dateStr || dateStr == '') return '';
//   if (esFormatoISO8601(dateStr) || utc) {
//     const fechaLocal: any = convertirFechaUTCaLocal(dateStr);
//     dateStr = fechaLocal
//       .toISOString()
//       .slice(0, 19)
//       .replace(/-/g, '-')
//       .replace('T', ' ');
//   }

//   dateStr = (dateStr + '').replace('T', ' ');
//   dateStr = dateStr.replace('/', '-');
//   const datetime = dateStr.split(' ');
//   const date = datetime[0].split('-');
//   let year = '';
//   if (date[0] != getUTCNow().substring(0, 4)) {
//     year = ` de ${date[0]}`;
//   }
//   return `${date[2]} de ${MONTHS[parseInt(date[1])]}${year}`;
// };

export const getDateStrMes = (
  dateStr: string,
  utc: boolean = false,
): string => {
  if (!dateStr || dateStr === '') return '';

  if (esFormatoISO8601(dateStr) || utc) {
    const fechaLocal: any = convertirFechaUTCaLocal(dateStr);
    dateStr = fechaLocal.toISOString().slice(0, 19).replace('T', ' ');
  }

  dateStr = dateStr.replace('T', ' ').replace('/', '-');
  const datetime = dateStr.split(' ');
  const date = datetime[0].split('-');

  if (date.length < 3) return '';

  const day = date[2].padStart(2, '0');
  const month = date[1].padStart(2, '0');
  const year = date[0];

  return `${day}/${month}/${year}`;
};
export const getDateStrMesAnio = (
  dateStr: string | null = '',
  utc: boolean = false,
): string => {
  if (!dateStr || dateStr == '') return '';
  if (esFormatoISO8601(dateStr) || utc) {
    const fechaLocal: any = convertirFechaUTCaLocal(dateStr);
    dateStr = fechaLocal
      .toISOString()
      .slice(0, 19)
      .replace(/-/g, '-')
      .replace('T', ' ');
  }

  dateStr = (dateStr + '').replace('T', ' ');
  dateStr = dateStr.replace('/', '-');
  const datetime = dateStr.split(' ');
  const date = datetime[0].split('-');
  return `${date[2]} de ${MONTHS[parseInt(date[1])]} de ${date[0]}`;
};

export const getNow = (): string => {
  const fec: any = convertirFechaUTCaLocal(new Date().toISOString());
  return fec.toISOString().substring(0, 10);
};

// Verifica si la fecha dada es hoy
export const isToday = (dateStr: string | null): boolean => {
  if (!dateStr) return false;

  const givenDate = convertirFechaUTCaLocal(dateStr)
    ?.toISOString()
    .substring(0, 10);
  const todayDate = getNow(); // obtiene la fecha de hoy en formato 'YYYY-MM-DD'

  return givenDate === todayDate;
};

// Formatea la fecha para mostrar 'Hoy' o 'dd de MMMM'
export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '';

  if (isToday(dateStr)) {
    return 'Hoy';
  }

  return getDateStrMes(dateStr); // devuelve el formato 'dd de MMMM'
};

// Función para calcular hace cuánto tiempo ocurrió una fecha o evento
export const getDateTimeAgo = (
  dateStr: string | null = '',
  utc: boolean = false,
): string => {
  if (!dateStr || dateStr === '') return '';

  let date: any;

  if (esFormatoISO8601(dateStr) || utc) {
    date = convertirFechaUTCaLocal(dateStr);
    if (!date) return 'Fecha inválida'; // Manejo de error en caso de que la conversión falle
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) {
    return 'Fecha inválida';
  }

  const now: any = convertirFechaUTCaLocal(new Date().toISOString());
  const diffMs = now.getTime() - date.getTime(); // Diferencia en milisegundos
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 1) {
    return 'Hace un momento';
  } else if (diffMinutes < 5) {
    return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffHours < 1) {
    return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  } else {
    return getDateTimeStrMes(dateStr, utc);
  }
};
export const getTimeAgoSimple = (
  dateStr: string | null = '',
  utc: boolean = false,
): string => {
  if (!dateStr || dateStr === '') return '';

  let date: any;

  if (esFormatoISO8601(dateStr) || utc) {
    date = convertirFechaUTCaLocal(dateStr);
    if (!date) return 'Fecha inválida';
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) {
    return 'Fecha inválida';
  }

  const now: any = convertirFechaUTCaLocal(new Date().toISOString());
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'Hace un momento';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} m`;
  } else if (diffHours < 24) {
    return `${diffHours} h`;
  } else {
    return `${diffDays} d`;
  }
};

export const getHour = (dateStr: string | null): string => {
  if (!dateStr || dateStr === '') return '';

  let date: any;

  if (esFormatoISO8601(dateStr)) {
    date = convertirFechaUTCaLocal(dateStr);
  } else {
    date = new Date(dateStr);
  }

  const hora = date.getHours() - GMT;
  const minutos = date.getMinutes();

  return `${hora}:${minutos.toString().padStart(2, '0')}`;
};
export const formatToDayDDMMYYYYHHMM = (
  dateStr: string | null = '',
  utc: boolean = true,
): string => {
  if (!dateStr || dateStr === '') return '';

  let dateForFormatting: Date;

  // 1. Obtener un objeto Date base
  if (esFormatoISO8601(dateStr) || utc) {
    // Para cadenas ISO o marcadas como UTC, usamos convertirFechaUTCaLocal
    // para intentar obtener un objeto Date que represente el tiempo local
    const convertedDate = convertirFechaUTCaLocal(dateStr);
    if (!convertedDate) return 'Fecha inválida';
    dateForFormatting = convertedDate;
  } else {
    let tempDate = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(tempDate.getTime())) {
      const parts = dateStr.split(/[- :\/]/);
      if (parts.length >= 6) {
        tempDate = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2]),
          Number(parts[3]),
          Number(parts[4]),
          Number(parts[5]),
        );
      } else if (parts.length >= 3) {
        tempDate = new Date(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2]),
        );
      }
      if (isNaN(tempDate.getTime())) return 'Fecha inválida';
    }
    dateForFormatting = tempDate;
  }

  // 2. Extraer componentes de fecha del objeto Date
  const diaSemana = DAYS_SHORT[dateForFormatting.getDay()];
  const dia = String(dateForFormatting.getDate()).padStart(2, '0');
  const mesNum = String(dateForFormatting.getMonth() + 1).padStart(2, '0');
  const año = dateForFormatting.getFullYear();

  // 3. Extraer componentes de hora locales
  let hora = dateForFormatting.getHours();
  let minutos = dateForFormatting.getMinutes();

  // Si la hora es exactamente 24:00, se ajusta a 23:59
  if (hora === 24 && minutos === 0) {
    hora = 23;
    minutos = 59;
  }

  const horaStr = String(hora).padStart(2, '0');
  const minutosStr = String(minutos).padStart(2, '0');

  return `${diaSemana}, ${dia}/${mesNum}/${año} - ${horaStr}:${minutosStr}`;
};
