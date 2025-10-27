import {Alert, ScrollView, View} from 'react-native';
import {cssVar, ThemeType} from '../../../mk/styles/themes';
import {
  IconDepartments,
} from '../../icons/IconLibrary';
import useAuth from '../../../mk/hooks/useAuth';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { getActivePage } from '../../../mk/utils/utils';

import configApp from '../../config/config';
import { getMenuItems , HeadProfile, ItemMenu, SocialIcons, VersionBuild } from './Items/index';

const MainMenu = ({navigation}: DrawerContentComponentProps) => {
  
  const {logout, user, setStore, store} = useAuth();
  const activeItem = getActivePage(navigation);

  const handleLogout = () => {
    Alert.alert('', '¿Cerrar la sesión de tu cuenta?', [
      {
        text: 'Cancelar',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel'
      },
      {text: 'Salir', style: 'destructive', onPress: () => logout()},
    ]);
  };

  const menuItems = getMenuItems({onLogout: handleLogout});

  return (
    <View style={theme.container}>

      <HeadProfile user={user} />

      <View style={theme.content}>
        <ScrollView>

          {menuItems.map((item, index) => (
            <ItemMenu
              key={`menu-item-${index}`}
              screen={item.screen}
              text={item.text}
              icon={item.icon}
              activeItem={activeItem}
              reverse={item.reverse}
              color={item.color}
              colorText={item.colorText}
              onPress={item.onPress}
            />
          ))}
          
          {user?.clients && user.clients.length > 1 && (
            <ItemMenu
              text="Cambiar Condominio"
              icon={IconDepartments}
              onPress={() => setStore({...store, openClient: true})}
            />
          )}

        </ScrollView>
      </View>

      <SocialIcons />

      {configApp.API_URL != configApp.API_URL_PROD && (
        <VersionBuild />
      )}

    </View>
  );
};

export default MainMenu;

const theme: ThemeType = {
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: cssVar.spM,
  }
};