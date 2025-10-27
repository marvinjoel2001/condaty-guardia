import {Alert, ScrollView, Text, View} from 'react-native';
import {cssVar, FONTS, ThemeType} from '../../../mk/styles/themes';
import {
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
  IconBitacora,
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
import configApp from '../../config/config';
import buildInfo from '../../../buildInfo.json';

const MainMenu = ({navigation}: DrawerContentComponentProps) => {
  
  const {logout, user, setStore, store} = useAuth();
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

  const menuItems = [
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
      onPress: handleLogout,
    },
  ];

  const socialIconsNetwork = [
    { icon: IconFacebook, link: 'https://www.facebook.com/CondatyApp' },
    { icon: IconInstagram, link: 'https://www.instagram.com/condatyapp/' },
    { icon: IconLinkedin, link: 'https://www.linkedin.com/company/condatyapp/' },
    { icon: IconYoutube, link: 'https://www.youtube.com/@CondatyApp' },
    { icon: IconTikTok, link: 'https://www.tiktok.com/@condatyapp' }
  ]

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
            hasImage={user?.has_image}
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
      <View 
        style={theme.socialIconsContainer}>
        {socialIconsNetwork.map((item, index) => (
          <Icon
            key={`social-icon-${index}`} 
            name={item.icon}
            color={cssVar.cWhiteV1}
            onPress={() => openLink(item.link)}
          />
        ))}
      </View>

      {/* About App - Build Info */}
      {configApp.API_URL != configApp.API_URL_PROD && (
        <View style={theme.aboutContainer}>
          <Text style={theme.aboutText}>
            Versión {buildInfo.version} - Build #{buildInfo.buildNumber}
          </Text>
          <Text style={theme.aboutSubtext}>
            {new Date(buildInfo.buildDate).toLocaleString('es-BO', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      )}
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
  aboutContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: cssVar.cBlackV2,
    alignItems: 'center',
  },
  aboutText: {
    color: cssVar.cWhiteV3,
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginBottom: 4,
  },
  aboutSubtext: {
    color: cssVar.cWhiteV3,
    fontSize: 10,
    fontFamily: FONTS.regular,
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: cssVar.spM,
    borderTopWidth: 1,
    borderTopColor: cssVar.cBlackV2,
  }
};

export default MainMenu;
