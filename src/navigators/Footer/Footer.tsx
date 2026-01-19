import React from 'react';
import { View } from 'react-native';
import ItemFoot from './ItemFoot';
import {
  IconAlertNotification,
  IconHistorial,
  IconHome,
  IconNovedades,
  IconCalendar,
} from '../../icons/IconLibrary';
import { cssVar, ThemeType } from '../../../mk/styles/themes';

const Footer = () => {
  return (
    <View style={{ ...theme.container }}>
      <ItemFoot path="Home" text="Inicio" icon={IconHome} />

      <ItemFoot path="Alerts" text="Alertas" icon={IconAlertNotification} />
      <ItemFoot path="History" text="Historial" icon={IconHistorial} />

      <ItemFoot path="Reservations" text="Reservas" icon={IconCalendar} />

      <ItemFoot path="Binnacle" text="Bitácora" icon={IconNovedades} />
    </View>
  );
};

export default Footer;

const theme: ThemeType = {
  container: {
    flexDirection: 'row',
    paddingVertical: cssVar.spM,
    backgroundColor: cssVar.cBlack,
    position: 'absolute',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 0.5,
    borderBottomWidth: 0,
    borderTopColor: cssVar.cWhiteV1,
    width: '100%',
    bottom: 0,
  },
};
