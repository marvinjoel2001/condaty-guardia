import {Dimensions, Platform, TextStyle, ViewStyle} from 'react-native';

export interface TypeStyles extends ViewStyle, TextStyle {}
export interface ThemeType {
  [key: string]: TypeStyles;
}
export const FONTS = {
  black: 'Roboto-Black',
  extraBold: 'Roboto-ExtraBold',
  bold: 'Roboto-Bold',
  semiBold: 'Roboto-SemiBold',
  medium: 'Roboto-Medium',
  regular: 'Roboto-Regular',
  light: 'Roboto-Light',
  thin: 'Roboto-Thin',
};
// export const FONTS = {
//   black: Platform.OS == 'ios' ? 'Roboto-Black' : 'Roboto Black',
//   extraBold: Platform.OS == 'ios' ? 'Roboto-ExtraBold' : 'Roboto ExtraBold',
//   bold: Platform.OS == 'ios' ? 'Roboto-Bold' : 'Roboto Bold',
//   semiBold: Platform.OS === 'ios' ? 'Roboto-SemiBold' : 'Roboto SemiBold',
//   medium: Platform.OS == 'ios' ? 'Roboto-Medium' : 'Roboto Medium',
//   regular: Platform.OS == 'ios' ? 'Roboto-Regular' : 'Roboto Regular',
//   light: Platform.OS == 'ios' ? 'Roboto-Light' : 'Roboto Light',
//   thin: Platform.OS == 'ios' ? 'Roboto-Thin' : 'Roboto Thin',
// };

export const cssVar = {
  cPrimary: '#212121',
  cSecondary: '#212121 ',
  cTerciary: '#212121 ',
  cAccent: '#00E38C',
  cWhite: '#FAFAFA',
  cWhiteV1: '#A7A7A7',
  cWhiteV2: '#414141',
  cWhiteV3: '#818181',
  cBlack: '#212121',
  cBlackV1: '#292929',
  cBlackV2: '#333536',
  cBlackV3: '#393C3F',
  cError: '#E46055',
  cSuccess: '#34A853',
  cInfo: '#4285FA',
  cWarning: '#E9B01E',
  cGrayLight: '#A7A7A7',
  cGrayLightV3: '#393C3F',
  cAlertMedio: '#F37F3D',
  cOrange: '#F58220',

  cSidebar: '#246950',
  cFillSidebar: '#1F2D27',

  cHover: '#FFFFFF0D',
  cHoverBlack: '#212121CC',
  cHoverBlackV2: '#33353633',
  cHovetablepdf: '#7979791A',
  cHoverSuccess: '#00AF9033',
  cHoverError: '#E4605533',
  cHoverInfo: '#4285FA33',
  cHoverWarning: '#E9B01E33',
  cHoverOrange: '#F5822033',
  cHoverCompl1: '#FAFAFA1A',
  cHoverCompl2: '#A2FAA333',
  cHoverCompl3: '#B382D933',
  cHoverCompl4: '#A9CCE333',
  CHoverComp4: '#E1C151',
  cHoverCompl5: '#F7B26733',
  cHoverCompl6: '#FF7F5133',
  cHoverCompl7: '#6CD16D33',
  cHoverCompl8: '#DE6A6033',
  cHoverCompl9: '#5AB0E933',

  /* Paleta de colores Random */
  cRandom1: '#a2d2bf',
  cRandom2: '#a9cce3',
  cRandom3: '#d8bfd8',
  cRandom4: '#faedcb',
  cRandom5: '#b382d9',
  cRandom6: '#f0a8b2',
  cRandom7: '#ffd9da',
  cRandom8: '#a2faa3',
  cRandom9: '#faff7f',
  cRandom10: '#d3c4e3',
  cRandom11: '#96bdc6',
  cRandom12: '#f8dda4',
  cRandom13: '#ffc6ff',
  cRandom14: '#f08080',
  cRandom15: '#bd4f91',
  cRandom16: '#ff7f51',
  cRandom17: '#fdf0d5',
  cRandom18: '#f7b267',
  cRandom19: '#b8c0ff',
  /* Paleta de complementos */
  cCompl1: '#FAFF7F',
  cCompl2: '#A2FAA3',
  cCompl3: '#B382D9',
  cCompl4: '#A9CCE3',
  cCompl5: '#F7B267',
  cCompl6: '#FF7F51',
  cCompl7: '#6CD16D',
  cCompl8: '#DE6A60',
  cCompl9: '#5AB0E9',

  //sizes
  sXxl: 24,
  sXl: 20,
  sL: 16,
  sM: 14,
  sS: 12,
  sXs: 10,
  sXxs: 8,
  //espaciados
  spXs: 4,
  spS: 8,
  spM: 12,
  spL: 16,
  spXl: 24,
  spXxl: 32,
  //radios
  bRadiusS: 8,
  bRadius: 12,
  bRadiusL: 20,
  bWidth: 1,
  //bolds
  bLight: '300',
  bRegular: '400',
  bMedium: '500',
  bSemibold: '600',
  bBold: '700',
  //responsives
  responsiveTablet: 768,
  responsiveMobile: 480,

  cHoverSecondary: '#21212133',
  cHoverAccent: '#00E38C33',
};

export const screenHeight = Dimensions.get('window').height;
