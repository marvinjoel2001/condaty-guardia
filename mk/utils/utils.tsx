import {Linking, Platform, Text, Vibration} from 'react-native';
import {cssVar} from '../styles/themes';
import {useNavigation} from '@react-navigation/native';
import {getUrlImages} from './strings';
import React from 'react';

export const genTimeTemp = () => {
  const time = new Date();
  const lTime =
    '' +
    time.getFullYear() +
    '' +
    String(time.getMonth()).padStart(2, '0') +
    '' +
    String(time.getDate()).padStart(2, '0') +
    '' +
    String(time.getHours()).padStart(2, '0') +
    '' +
    String(time.getMinutes()).padStart(2, '0') +
    '';
  console.log('getTime', lTime);
  return lTime;
};

export const isValidTimeTemp = (_time: any, offset: number = 10) => {
  const time: number = 1 * (_time || 0);
  const now: any = genTimeTemp();
  console.log('now', now, time, 'a', Math.abs(now - time));
  return Math.abs(now - time) < offset;
};

export const throttle = (func: Function, delay: number) => {
  let lastCall: number = 0;
  return function (...args: any) {
    const now: number = new Date().getTime();
    if (delay > now - lastCall) {
      return;
    }
    lastCall = now;
    func(...args);
  };
};

export const debounce = (func: Function, delay: number) => {
  let timeoutId: any;
  return function (...args: any) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const getActivePage = (navigation: any) => {
  let activeItem = 'Home';
  let active = -1;
  active = navigation.getState().index;
  if (active > -1) {
    let route = navigation.getState().routes[active];
    if (route.state?.index != undefined) {
      let subactive = route.state.index;
      if (subactive == undefined) subactive = 0;
      let subroute = route.state.routes[subactive];
      activeItem = subroute.name;
    } else {
      activeItem = route.name;
    }
  }

  if (['Tabs', 'Pagina1'].includes(activeItem)) {
    activeItem = 'Home';
  }

  return activeItem;
};

export const capitalizeFirstLetter = (string: string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const removeAccents = (str: string) => {
  return str?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const highlightText = (text: string, searchTerm: string) => {
  if (!searchTerm) return <Text>{text}</Text>;

  // Eliminamos acentos para la comparación
  const normalizedText = removeAccents(text);
  const normalizedSearchTerm = removeAccents(searchTerm);

  // ignore mayúsculas/minúsculas
  const regex = new RegExp(`(${normalizedSearchTerm})`, 'gi');
  const parts = normalizedText?.split(regex);

  return parts?.map((part, index) => {
    const originalPart = text.substr(normalizedText.indexOf(part), part.length);

    return part.toLowerCase() === normalizedSearchTerm.toLowerCase() ? (
      <Text
        key={index}
        style={{backgroundColor: '#E1C1511A', color: cssVar.cWarning}}>
        {originalPart}
      </Text>
    ) : (
      <Text key={index}>{originalPart}</Text>
    );
  });
};

export const getPercentajeUser = (item: any) => {
  return (item.leagues?.[0]?.points / item.leagues?.[0]?.nextlevel) * 100;
};

export const navigate = (path: any) => {
  const navigate: any = useNavigation();

  return navigate.navigate(path);
};

export const logPerformance = (setFpsColor: Function = () => {}) => {
  const startTime = performance.now();
  // console.log('Inicio de renderizado del frame');
  requestAnimationFrame(() => {
    const endTime = performance.now();
    // console.log(`Tiempo de renderizado del frame : ${endTime - startTime}ms`);
    const fps = 1000 / (endTime - startTime);

    if (fps > 50) {
      setFpsColor('green');
    } else if (fps > 30) {
      setFpsColor('yellow');
    } else {
      setFpsColor('red');
    }
  });
};

export const extractYouTubeVideoId = (url: any) => {
  let videoId = null;

  // Para URL en formato largo (con ?v=)
  const longUrlMatch = url.match(/[?&]v=([^&#]*)/);
  if (longUrlMatch) {
    videoId = longUrlMatch[1];
  }

  // Para URL en formato corto (youtu.be)
  const shortUrlMatch = url.match(/youtu\.be\/([^?&#]+)/);
  if (shortUrlMatch) {
    videoId = shortUrlMatch[1];
  }

  return videoId;
};
export const openLink = (url: any) => {
  // const link: any = isEvent ? data.link_event : linkUrl;
  // Linking.openURL(url).catch(err =>
  //   showToast('Ha ocurrido un error inesperado', err),
  // );
  Linking.openURL(url);
};
export const vibrate = () => {
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 10]);
  } else {
    Vibration.vibrate(1);
  }
};

export const openDocument = (data: any) => {
  // console.log(data);
  let url = getUrlImages(
    '/CONT-' + data?.id + '.' + data?.url + '?d=' + data?.updated_at,
  );
  // console.log(url);
  Linking.openURL(url);
};
