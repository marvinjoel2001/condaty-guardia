import {Alert, ScrollView, Text, View} from 'react-native';
import {cssVar, FONTS, ThemeType} from '../../../mk/styles/themes';
import {
  IconAlert,
  IconAlertNotification,
  IconDepartments,
  IconDocs,
  IconFacebook,
  IconHistorial,
  IconHome,
  IconInstagram,
  IconLinkedin,
  IconLogout,
  IconNotification,
  IconNovedades,
  IconTikTok,
  IconUser,
  IconYoutube,
} from '../../icons/IconLibrary';
import useAuth from '../../../mk/hooks/useAuth';
import {DrawerContentComponentProps} from '@react-navigation/drawer';
import ItemMenu from './ItemMenu';
import {getActivePage, openLink} from '../../../mk/utils/utils';
import {getFullName, getUrlImages} from '../../../mk/utils/strings';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';
import {useNavigation} from '@react-navigation/native';
import Icon from '../../../mk/components/ui/Icon/Icon';

const MainMenu = ({navigation}: DrawerContentComponentProps) => {
  const {logout, user, setStore, store} = useAuth();
  const activeItem = getActivePage(navigation);

  // const navigateTo = (screen: string) => {
  //   navigation.navigate(screen);
  // };
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
  const Head = () => {
    const navigationn: any = useNavigation();
    return (
      <ItemList
        title={getFullName(user)}
        onPress={() => navigationn.navigate('Profile')}
        style={{backgroundColor: 'transparent'}}
        subtitle={'Guardia'}
        left={
          <Avatar
            name={getFullName(user)}
            onClick={() => navigationn.navigate('Profile')}
            src={getUrlImages(
              '/GUARD-' + user?.id + '.webp?d=' + user?.updated_at,
            )}
            style={theme.avatar}
            w={62}
            h={62}
          />
        }
      />
    );
  };

  return (
    <View style={theme.container}>
      <Head />
      <View style={theme.content}>
        <ScrollView>
          <ItemMenu
            screen="Home"
            text="Inicio"
            icon={IconHome}
            activeItem={activeItem}
            reverse
          />

          <ItemMenu
            screen="Profile"
            text="Mi perfil"
            icon={IconUser}
            activeItem={activeItem}
          />
          <ItemMenu
            screen="History"
            text="Historial"
            icon={IconHistorial}
            activeItem={activeItem}
            reverse
          />
          <ItemMenu
            screen="Alerts"
            text="Alertas"
            icon={IconAlertNotification}
            activeItem={activeItem}
            reverse
          />

          <ItemMenu
            screen="Binnacle"
            text="Bitácora"
            icon={IconNovedades}
            reverse
            activeItem={activeItem}
          />
          <ItemMenu
            screen="Notifications"
            text="Notificaciones"
            icon={IconNotification}
            activeItem={activeItem}
            reverse
          />
          {user?.clients && user.clients.length > 1 && (
            <ItemMenu
              // screen="CambiarCondo"
              text="Cambiar Condominio"
              icon={IconDepartments}
              // activeItem={activeItem}

              onPress={() => setStore({...store, openClient: true})}
            />
          )}
          <ItemMenu
            screen="Documents"
            text="Documentos"
            icon={IconDocs}
            activeItem={activeItem}
          />
          <ItemMenu
            text="Cerrar sesión"
            onPress={() => handleLogout()}
            icon={IconLogout}
            color={cssVar.cError}
            colorText={cssVar.cError}
          />
        </ScrollView>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingVertical: cssVar.spM,
          borderTopWidth: 1,
          borderTopColor: cssVar.cBlackV2,
        }}>
        <Icon
          name={IconFacebook}
          color={cssVar.cWhiteV1}
          onPress={() => openLink('https://www.facebook.com/condaty.bo')}
        />
        <Icon
          name={IconInstagram}
          color={cssVar.cWhiteV1}
          onPress={() => openLink('https://www.instagram.com/condaty.bo')}
        />
        <Icon
          name={IconTikTok}
          color={cssVar.cWhiteV1}
          onPress={() => openLink('https://www.tiktok.com/@condaty.bo')}
        />
        <Icon
          name={IconYoutube}
          color={cssVar.cWhiteV1}
          onPress={() =>
            openLink('https://www.youtube.com/channel/UCoMKYylu7j4gg9hoyHexV-A')
          }
        />
        <Icon
          name={IconLinkedin}
          color={cssVar.cWhiteV1}
          onPress={() =>
            openLink('https://www.linkedin.com/in/condaty-by-fos-54a58627a/')
          }
        />
      </View>
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
