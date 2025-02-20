import {View, Text} from 'react-native';
import configApp from '../../src/config/config';
import React from 'react';
export const initialsName = (name: string): string => {
  const names = (name + ' ').split(' ');
  return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase().trim();
};

export const capitalize = (s: string): string => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const capitalizeWords = (s: string): string => {
  const words = (s.toLowerCase() + ' ').split(' ');
  let result = '';
  words.map(word => {
    result += capitalize(word) + ' ';
  });
  return result.trim();
};

export const getUrlImages = (url: string): string => {
  const lastIndexOfString = configApp.API_URL.lastIndexOf('/api');
  if (lastIndexOfString === -1) {
    return configApp.API_URL + url;
  }
  const newUrl =
    configApp.API_URL.substring(0, lastIndexOfString) + '/storage' + url;

  return newUrl;
};

export const getFullName = (data: any): string => {
  if (!data) {
    return '';
  }
  const {name, middle_name, last_name, mother_last_name} = data;
  let fullName = '';
  if (name) {
    fullName += name + ' ';
  }
  if (middle_name) {
    fullName += middle_name + ' ';
  }
  if (last_name) {
    fullName += last_name + ' ';
  }
  if (mother_last_name) {
    fullName += mother_last_name + ' ';
  }
  return fullName.trim();
};

export const displayObjectAsHtml = (
  obj: Record<string, any>,
  style: any = {},
): JSX.Element => {
  return (
    <View style={style}>
      {Object.entries(obj).map(([key, value]) => (
        <View key={key} style={{display: 'flex', flexDirection: 'row', gap: 5}}>
          <Text style={{color: 'red'}}>{key}:</Text>
          <Text>{value}</Text>
        </View>
      ))}
    </View>
  );
};
export const PREFIX_COUNTRY = [
  {id: '54', name: '🇦🇷 Argentina'}, // Argentina
  {id: '297', name: '🇦🇼 Aruba'}, // Aruba
  {id: '591', name: '🇧🇴 Bolivia'}, // Bolivia
  {id: '55', name: '🇧🇷 Brasil'}, // Brasil
  // {id: '1', name: '🇧🇸 Bahamas'}, // Bahamas
  // {id: '1', name: '🇧🇧 Barbados'}, // Barbados
  // {id: '1', name: '🇧🇿 Belice'}, // Belice
  // {id: '1', name: '🇧🇲 Bermudas'}, // Bermudas
  // {id: '1', name: '🇨🇦 Canadá'}, // Canadá
  {id: '56', name: '🇨🇱 Chile'}, // Chile
  {id: '57', name: '🇨🇴 Colombia'}, // Colombia
  {id: '506', name: '🇨🇷 Costa Rica'}, // Costa Rica
  {id: '53', name: '🇨🇺 Cuba'}, // Cuba
  // {id: '1', name: '🇩🇲 Dominica'}, // Dominica
  // {id: '1', name: '🇩🇴 República Dominicana'}, // República Dominicana
  {id: '593', name: '🇪🇨 Ecuador'}, // Ecuador
  {id: '503', name: '🇸🇻 El Salvador'}, // El Salvador
  {id: '500', name: '🇫🇰 Islas Malvinas (Falkland Islands)'}, // Islas Malvinas (Falkland Islands)
  // {id: '1', name: '🇬🇩 Granada'}, // Granada
  {id: '502', name: '🇬🇹 Guatemala'}, // Guatemala
  {id: '592', name: '🇬🇾 Guyana'}, // Guyana
  {id: '509', name: '🇭🇹 Haití'}, // Haití
  {id: '504', name: '🇭🇳 Honduras'}, // Honduras
  {id: '52', name: '🇲🇽 México'}, // México
  // {id: '1', name: '🇯🇲 Jamaica'}, // Jamaica
  // {id: '1', name: '🇰🇳 San Cristóbal y Nieves'}, // San Cristóbal y Nieves
  // {id: '1', name: '🇱🇨 Santa Lucía'}, // Santa Lucía
  // {id: '1', name: '🇻🇨 San Vicente y las Granadinas'}, // San Vicente y las Granadinas
  {id: '505', name: '🇳🇮 Nicaragua'}, // Nicaragua
  {id: '507', name: '🇵🇦 Panamá'}, // Panamá
  {id: '595', name: '🇵🇾 Paraguay'}, // Paraguay
  {id: '51', name: '🇵🇪 Perú'}, // Perú
  // {id: '1', name: '🇵🇷 Puerto Rico'}, // Puerto Rico
  // {id: '1', name: '🇹🇹 Trinidad y Tobago'}, // Trinidad y Tobago
  {id: '1', name: '🇺🇸 Estados Unidos'}, // Estados Unidos
  {id: '598', name: '🇺🇾 Uruguay'}, // Uruguay
  {id: '58', name: '🇻🇪 Venezuela'}, // Venezuela
];

export let lIdeologies = [
  {id: '0', name: 'Izquierda'},
  {id: '1', name: 'Centro-Izquierda'},
  {id: '2', name: 'Centro'},
  {id: '3', name: 'Centro-Derecha'},
  {id: '4', name: 'Derecha'},
  {id: '5', name: 'Extrema Izquierda'},
  {id: '6', name: 'Extrema Derecha'},
  {id: '7', name: 'Liberalismo'},
  {id: '8', name: 'Conservadurismo'},
  {id: '9', name: 'Socialismo'},
  {id: '10', name: 'Comunismo'},
  {id: '11', name: 'Anarquismo'},
  {id: '12', name: 'Fascismo'},
  {id: '13', name: 'Nacionalismo'},
  {id: '14', name: 'Ecologismo'},
  {id: '15', name: 'Libertarismo'},
  {id: '16', name: 'Populismo'},
  {id: '17', name: 'Progresismo'},
  {id: '18', name: 'Neoliberalismo'},
  {id: '19', name: 'Socialdemocracia'},
  {id: '20', name: 'Democracia Cristiana'},
  {id: '21', name: 'Marxismo'},
  {id: '22', name: 'Feminismo'},
  {id: '23', name: 'Monarquismo'},
  {id: '24', name: 'Republicanismo'},
];
