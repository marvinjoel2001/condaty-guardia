import {useNavigation, useRoute} from '@react-navigation/native';
import {Platform, Text, TouchableOpacity, View} from 'react-native';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {cssVar, FONTS, ThemeType} from '../../../mk/styles/themes';
import useAuth from '../../../mk/hooks/useAuth';
import {useState} from 'react';
import React from 'react';

interface PropsType {
  path: string;
  text: string;
  icon: string;
  reverse?: boolean;
  isActived?: boolean;
}

const ItemFoot = ({path, text, icon, reverse, isActived}: PropsType) => {
  const navigation: any = useNavigation();
  const route = useRoute();
  const activeItem = route.name;
  const [iconColor, setIconColor] = useState('transparent');
  const {store, setStore} = useAuth();
  const _onPress = () => {
    navigation.navigate(path);
    setStore({...store, scrollTop: true});
  };

  return (
    <TouchableOpacity
      style={{
        ...theme.container,
        height: Platform.OS === 'android' ? 48 : 44,

        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: iconColor,
        borderRadius: 8,
      }}
      onPressIn={() => setIconColor(cssVar.cHover)}
      onPressOut={() => setIconColor('transparent')}
      onPress={() => _onPress()}>
      <View style={theme.iconContainer}>
        <Icon
          name={icon}
          color={
            reverse
              ? 'transparent'
              : activeItem == path
              ? cssVar.cAccent
              : cssVar.cWhiteV1
          }
          fillStroke={
            !reverse
              ? 'transparent'
              : activeItem == path
              ? cssVar.cAccent
              : cssVar.cWhiteV1
          }
        />
        {isActived && <View style={theme.redDot} />}
      </View>
      <Text
        style={{
          ...theme.text,
          color: activeItem == path ? cssVar.cAccent : cssVar.cWhiteV1,
        }}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const theme: ThemeType = {
  container: {
    paddingVertical: cssVar.spXs,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: cssVar.sS,
    fontFamily: FONTS.regular,
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  redDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: cssVar.cSuccess,
  },
};

export default ItemFoot;
