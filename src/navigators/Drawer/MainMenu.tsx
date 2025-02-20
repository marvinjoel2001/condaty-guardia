import {Alert, ScrollView, Text, View} from 'react-native';
import {cssVar, FONTS, ThemeType} from '../../../mk/styles/themes';
import {IconLogout, IconUser} from '../../icons/IconLibrary';
import useAuth from '../../../mk/hooks/useAuth';
import {DrawerContentComponentProps} from '@react-navigation/drawer';
import ItemMenu from './ItemMenu';
import {getActivePage} from '../../../mk/utils/utils';
import {getFullName, getUrlImages} from '../../../mk/utils/strings';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';

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
      <Text style={theme.title}>ELEKTA</Text>
      <Avatar
        name={getFullName(user)}
        src={getUrlImages('/AFF-' + user?.id + '.webp?d=' + user?.updated_at)}
        style={theme.avatar}
        w={64}
        h={64}
      />
      <Text style={theme.name}>{getFullName(user)}</Text>
      <Text style={theme.subtitle}>Afiliado</Text>
      <View style={theme.content}>
        <ScrollView>
          <ItemMenu
            screen="home"
            text="Inicio"
            icon={IconUser}
            activeItem={activeItem}
            color={cssVar.cBlackV2}
          />

          <ItemMenu
            screen="communication"
            text="Comunicación"
            icon={IconUser}
            activeItem={activeItem}
            color={cssVar.cBlackV2}
          />

          <ItemMenu
            screen="red"
            text="Mi red"
            icon={IconUser}
            activeItem={activeItem}
            color={cssVar.cBlackV2}
          />

          <ItemMenu
            screen="profile"
            text="Mi perfil"
            icon={IconUser}
            activeItem={activeItem}
            color={cssVar.cBlackV2}
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
