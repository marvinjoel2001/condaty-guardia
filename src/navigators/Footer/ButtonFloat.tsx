import {useState} from 'react';
import {cssVar, FONTS, ThemeType} from '../../../mk/styles/themes';
import {Text, View} from 'react-native';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {IconSimpleAdd, IconUser} from '../../icons/IconLibrary';
import {useNavigation} from '@react-navigation/native';
import React from 'react';

const ButtonFloat = () => {
  const [open, setOpen] = useState(false);
  const navigation: any = useNavigation();
  return (
    <>
      <View style={theme.iconFloat} onTouchEnd={() => setOpen(true)}>
        <Icon name={IconSimpleAdd} color={cssVar.cBlack} />
      </View>
      {open && (
        <View onTouchEnd={() => setOpen(false)} style={theme.overlayOptions}>
          <View style={theme.containerOptions}>
            <View style={theme.oneOption}>
              <Icon
                style={theme.bgIcon}
                onPress={(e: any) => {
                  e.stopPropagation();
                  navigation.navigate('profile');
                }}
                name={IconUser}
                color={cssVar.cWhite}
              />
              <Text style={theme.textOptions}>Perfil</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'center',
              }}>
              <View style={theme.twoOptions}>
                <Icon
                  style={theme.bgIcon}
                  onPress={(e: any) => {
                    e.stopPropagation();
                    navigation.navigate('affiliates');
                  }}
                  name={IconUser}
                  color={cssVar.cWhite}
                />
                <Text style={theme.textOptions}>Afiliados</Text>
              </View>
              <View style={theme.twoOptions}>
                <Icon
                  style={theme.bgIcon}
                  name={IconUser}
                  color={cssVar.cWhite}
                  onPress={(e: any) => {
                    e.stopPropagation();
                    navigation.navigate('users');
                  }}
                />
                <Text style={theme.textOptions}>Usuarios</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  );
};
const theme: ThemeType = {
  iconFloat: {
    position: 'absolute',
    backgroundColor: cssVar.cWhite,
    padding: 12,
    borderRadius: 100,
    // top: -36,
    bottom: 52,
    left: '50%',
    transform: [{translateX: -23}],
  },
  bgIcon: {
    backgroundColor: cssVar.cBlack,
    padding: 12,
    borderRadius: 100,
  },
  overlayOptions: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: cssVar.cWhite + '1A',
    justifyContent: 'flex-end',
  },
  containerOptions: {
    marginBottom: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oneOption: {
    marginBottom: 12,
    alignItems: 'center',
  },
  twoOptions: {
    alignItems: 'center',
    width: '50%',
  },
  textOptions: {
    color: cssVar.cWhite,
    fontSize: cssVar.sS,
    fontFamily: FONTS.semiBold,
  },
};

export default ButtonFloat;
