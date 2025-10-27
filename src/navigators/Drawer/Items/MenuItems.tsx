import {cssVar} from '../../../../mk/styles/themes';
import {
  IconAlertNotification,
  IconDocs,
  IconHistorial,
  IconHome,
  IconLogout,
  IconNotification,
  IconBitacora,
  IconUser,
} from '../../../icons/IconLibrary';
import {ItemMenuProps} from '../../../types/menu-types';

type GetMenuItemsOptions = {
  onLogout: () => void;
};

export const getMenuItems = ({onLogout}: GetMenuItemsOptions): ItemMenuProps[] => {
  return [
    {
      screen: 'Home',
      text: 'Inicio',
      icon: IconHome,
      reverse: true,
    },
    {
      screen: 'Profile',
      text: 'Mi perfil',
      icon: IconUser,
    },
    {
      screen: 'History',
      text: 'Historial',
      icon: IconHistorial,
      reverse: true,
    },
    {
      screen: 'Alerts',
      text: 'Alertas',
      icon: IconAlertNotification,
      reverse: true,
    },
    {
      screen: 'Binnacle',
      text: 'Bitácora',
      icon: IconBitacora,
      color: cssVar.cWhiteV1,
    },
    {
      screen: 'Notifications',
      text: 'Notificaciones',
      icon: IconNotification,
      reverse: true,
    },
    {
      screen: 'Documents',
      text: 'Documentos',
      icon: IconDocs,
    },
    {
      text: 'Cerrar sesión',
      icon: IconLogout,
      color: cssVar.cError,
      colorText: cssVar.cError,
      onPress: onLogout,
    },
  ];
};

export default getMenuItems;
