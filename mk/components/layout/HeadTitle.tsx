import React from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {TouchableOpacity, View, Text, Animated} from 'react-native';
import Icon from '../ui/Icon/Icon';
import {
  IconArrowLeft,
  IconMenu,
  IconNotification,
} from '../../../src/icons/IconLibrary';
import Avatar from '../ui/Avatar/Avatar';
import {getFullName, getUrlImages} from '../../utils/strings';
import useAuth from '../../hooks/useAuth';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../styles/themes';
import {getPercentajeUser} from '../../utils/utils';
import TextLog from '../ui/TextLog/TextLog';

interface HeadTitleProps {
  title: string;
  backUrl?: string;
  style?: TypeStyles;
  onBack?: (() => void) | null;
  customTitle?: any;
  right?: any;
  back?: boolean;
  avatar?: boolean;
}

const HeadTitle = ({
  title,
  backUrl = '',
  style = {},
  customTitle = null,
  onBack = null,
  right,
  back = false,
  avatar = false,
}: HeadTitleProps) => {
  const navigation: any = useNavigation();
  const route = useRoute();
  const {user} = useAuth();

  const goBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (backUrl !== '') {
      navigation.navigate(backUrl);
      return;
    }
    navigation.goBack();
  };

  const goProfile = () => {
    navigation.navigate('profile');
  };
  const togleDrawer = () => {
    navigation.toggleDrawer();
  };

  return (
    <Animated.View style={{...theme.container, ...style}}>
      {route.name == 'Home' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            backgroundColor: cssVar.cWhite,
            borderRadius: '100%',
          }}
          onTouchEnd={() => togleDrawer()}>
          <Icon name={IconMenu} color={cssVar.cBlack} />
        </View>
      )}
      {back && (
        <TouchableOpacity onPress={goBack} accessibilityLabel={'Volver atrás'}>
          <View style={theme.back}>
            <Icon name={IconArrowLeft} color={theme?.back?.color} />
          </View>
        </TouchableOpacity>
      )}

      {customTitle ? (
        <View style={theme.customTitle}>{customTitle}</View>
      ) : (
        <Text
          style={{
            ...theme.title,
          }}>
          {title}
        </Text>
      )}
      {right && <View>{right}</View>}
      {route.name == 'Home' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 8,
            backgroundColor: cssVar.cWhite,
            borderRadius: '100%',
          }}
          onTouchEnd={() => {}}>
          <Icon name={IconNotification} color={cssVar.cBlack} />
        </View>
      )}
    </Animated.View>
  );
};

export default HeadTitle;

const theme: ThemeType = {
  container: {
    width: '100%',
    backgroundColor: cssVar.cBlack,
    borderBottomWidth: 1,
    borderBottomColor: cssVar.cWhiteV1,
    padding: cssVar.spS,
    shadowColor: 'black',
    alignItems: 'center',
    flexDirection: 'row',
  },
  back: {
    justifyContent: 'center',
    padding: cssVar.spXs,
    alignItems: 'center',
    color: cssVar.cBlackV2,
  },
  customTitle: {
    flexGrow: 1,
    fontFamily: FONTS.bold,
    fontSize: cssVar.sXl,
    // paddingTop: cssVar.spL,
  },
  title: {
    flexGrow: 1,
    paddingLeft: cssVar.spM,
    color: cssVar.cWhite,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    fontSize: cssVar.sXl,
  },
  bage: {
    position: 'absolute',
    top: -5,
    right: -8,
    borderRadius: 100,
    backgroundColor: cssVar.cError,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBage: {
    fontSize: cssVar.sXs,
    fontFamily: FONTS.bold,
    color: cssVar.cWhite,
  },
};
