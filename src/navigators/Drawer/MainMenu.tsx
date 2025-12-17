import { Alert, View } from 'react-native';
import { ThemeType } from '../../../mk/styles/themes';

import useAuth from '../../../mk/hooks/useAuth';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { getActivePage } from '../../../mk/utils/utils';

import configApp from '../../config/config';
import {
  getMenuItems,
  HeadProfile,
  SocialIcons,
  VersionBuild,
} from './Items/index';
import Menu from './Items/Menu';

const MainMenu = ({ navigation }: DrawerContentComponentProps) => {
  const { logout, user, setStore, store } = useAuth();
  const activeItem = getActivePage(navigation);

  const handleLogout = () => {
    Alert.alert('', '¿Cerrar la sesión de tu cuenta?', [
      {
        text: 'Cancelar',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      { text: 'Salir', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const menuItems = getMenuItems({ onLogout: handleLogout });

  return (
    <View style={theme.container}>
      <HeadProfile user={user} />

      <Menu
        menuItems={menuItems}
        activeItem={activeItem}
        user={user}
        store={store}
        setStore={setStore}
      />

      <SocialIcons />

      {configApp.API_URL != configApp.API_URL_PROD && <VersionBuild />}
    </View>
  );
};

export default MainMenu;

const theme: ThemeType = {
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
};
