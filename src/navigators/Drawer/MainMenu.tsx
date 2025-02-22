import {Alert, ScrollView, Text, View} from 'react-native';
import {cssVar, FONTS, ThemeType} from '../../../mk/styles/themes';
import {
  IconAlert,
  IconDocs,
  IconHome,
  IconLogout,
  IconNovedades,
  IconUser,
} from '../../icons/IconLibrary';
import useAuth from '../../../mk/hooks/useAuth';
import {DrawerContentComponentProps} from '@react-navigation/drawer';
import ItemMenu from './ItemMenu';
import {getActivePage} from '../../../mk/utils/utils';
import {getFullName, getUrlImages} from '../../../mk/utils/strings';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';

const MainMenu = ({navigation}: DrawerContentComponentProps) => {
  const {logout, user} = useAuth();
  const activeItem = getActivePage(navigation);
  const handleLogout = () => {
    Alert.alert('', '¿Cerrar la sesión de tu cuenta?', [
      {
        text: 'Cancelar',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {text: 'Salir', style: 'destructive', onPress: () => logout()},
    ]);
  };

  return (
    <View style={theme.container}>
      <ItemList
        title={getFullName(user)}
        style={{backgroundColor: 'transparent'}}
        subtitle={'Guardia'}
        left={
          <Avatar
            name={getFullName(user)}
            src={getUrlImages(
              '/AFF-' + user?.id + '.webp?d=' + user?.updated_at,
            )}
            style={theme.avatar}
            // w={64}
            // h={64}
          />
        }
      />

      <View style={theme.content}>
        <ScrollView>
          <ItemMenu
            screen="Home"
            text="Inicio"
            icon={IconHome}
            activeItem={activeItem}
            color={cssVar.cWhiteV2}
            reverse
          />

          <ItemMenu
            screen="Profile"
            text="Mi perfil"
            icon={IconUser}
            activeItem={activeItem}
            color={cssVar.cWhiteV2}
          />
          <ItemMenu
            screen="Alerts"
            text="Alertas"
            icon={IconAlert}
            activeItem={activeItem}
            color={cssVar.cWhiteV2}
            reverse
          />

          <ItemMenu
            screen="Binnacle"
            text="Bitácora"
            icon={IconNovedades}
            reverse
            activeItem={activeItem}
            color={cssVar.cWhiteV2}
          />
          <ItemMenu
            screen="Documents"
            text="Documentos"
            icon={IconDocs}
            activeItem={activeItem}
            color={cssVar.cWhiteV2}
          />
        </ScrollView>
      </View>
      <ItemMenu
        text="Cerrar sesión"
        onPress={() => handleLogout()}
        icon={IconLogout}
        color={cssVar.cError}
        colorText={cssVar.cError}
      />
    </View>
  );
};

const theme: ThemeType = {
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: cssVar.spM,
  },
  title: {
    color: cssVar.cWhite,
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
    fontSize: cssVar.sXxl,
    marginTop: cssVar.spXl,
  },
  avatar: {
    width: 64,
    height: 64,
    alignSelf: 'center',
    marginVertical: 10,
  },
  name: {
    color: cssVar.cWhite,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    fontSize: cssVar.sM,
  },
  subtitle: {
    color: cssVar.cBlackV2,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    fontSize: cssVar.sS,
    marginBottom: cssVar.spXl,
  },
};

export default MainMenu;
