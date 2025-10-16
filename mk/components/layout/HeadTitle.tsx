import React, {useCallback, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {TouchableOpacity, View, Text, Animated} from 'react-native';
import Icon from '../ui/Icon/Icon';
import {
  IconArrowLeft,
  IconMenu,
  IconNotification,
  IconGenericQr,
  IconTrash,
} from '../../../src/icons/IconLibrary';
import useAuth from '../../hooks/useAuth';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../styles/themes';
import {useEvent} from '../../hooks/useEvent';

interface HeadTitleProps {
  title: string;
  backUrl?: string;
  style?: TypeStyles;
  onBack?: (() => void) | null;
  onlyBack?: boolean;
  customTitle?: any;
  right?: any;
  back?: boolean;
  avatar?: boolean;
  iconClose?: boolean;
  modalLayout?: boolean;
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
  onlyBack = false,
  iconClose = true,
  modalLayout = false,
}: HeadTitleProps) => {
  const navigation: any = useNavigation();
  const route = useRoute();
  const {user} = useAuth();
  const [counter, setCounter] = useState(0);
  const [selected, setSelected]: any = useState({cant: 0, type: ''});

  const onNotif = useCallback((data: any) => {
    setCounter(old => old + 1);
  }, []);
  const onResetNotif = useCallback((data: any) => {
    setCounter(0);
  }, []);
  const onSelect = useCallback((data: any) => {
    setSelected(data);
  }, []);

  useEvent('onNotif', onNotif);
  useEvent('onResetNotif', onResetNotif);
  useEvent('onSelect', onSelect);
  const {dispatch}: any = useEvent('onActionSel');

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

  const togleDrawer = () => {
    navigation.toggleDrawer();
  };

  return (
    <Animated.View
      style={{
        ...theme.container,
        ...style,
        alignItems: route.name === 'Home' ? 'flex-start' : 'center',
      }}>
      {/* Lado izquierdo - 20% o 30% */}
      <View style={modalLayout ? theme.leftSectionModal : theme.leftSection}>
        {route.name === 'Home' && !onlyBack ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 8,
              backgroundColor: cssVar.cBlack,
              borderRadius: '100%',
              alignSelf: 'flex-start',
            }}
            onTouchEnd={() => togleDrawer()}>
            <Icon name={IconMenu} color={cssVar.cWhite} />
          </View>
        ) : iconClose ? (
          <TouchableOpacity
            onPress={goBack}
            accessibilityLabel={'Volver atrás'}
            style={{zIndex: 10}}>
            <View style={theme.back}>
              <Icon name={IconArrowLeft} color={cssVar.cWhite} />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Centro - 60% o 40% */}
      <View
        style={modalLayout ? theme.centerSectionModal : theme.centerSection}
        pointerEvents="box-none">
        {customTitle ? (
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            {typeof customTitle === 'string' ? (
              <Text style={theme.title}>{customTitle}</Text>
            ) : (
              customTitle
            )}
          </View>
        ) : (
          <Text
            ellipsizeMode="tail"
            numberOfLines={1}
            accessibilityLabel={title}
            style={theme.title}>
            {selected?.cant === 0 ? title : selected?.cant + ' seleccionados'}
          </Text>
        )}
      </View>

      {/* Lado derecho - 20% o 30% */}
      <View style={modalLayout ? theme.rightSectionModal : theme.rightSection}>
        {selected?.cant > 0 ? (
          <View style={{flexDirection: 'row', gap: 12}}>
            <Icon
              onPress={() => {
                dispatch({action: 'delete', type: selected?.type});
                setSelected({cant: 0, type: ''});
              }}
              name={IconTrash}
              color={'transparent'}
              fillStroke={cssVar.cWhite}
            />
            <Icon
              name={IconGenericQr}
              onPress={() => {
                dispatch({action: 'qr', type: selected?.type});
                setSelected({cant: 0, type: ''});
              }}
              color={cssVar.cWhite}
            />
          </View>
        ) : (
          right && <View style={theme.topIcon}>{right}</View>
        )}

        {route.name === 'Home' && !onlyBack && (
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <View style={theme.notifButton}>
              <Icon name={IconNotification} color={cssVar.cWhite} />
              {counter > 0 && (
                <View style={theme.notifPoint}>
                  <Text style={theme.notifPointNumber}>
                    {counter > 99 ? '99+' : counter}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export default HeadTitle;

const theme: ThemeType = {
  container: {
    width: '100%',
    backgroundColor: cssVar.cBlack,
    borderWidth: 0.5,
    borderTopWidth: 0,
    borderBottomColor: cssVar.cWhiteV1,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: cssVar.spS,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftSection: {
    width: '30%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  leftSectionModal: {
    width: '20%',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSection: {
    width: '40%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSectionModal: {
    width: '60%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    width: '30%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  rightSectionModal: {
    width: '20%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  back: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    zIndex: 10,
  },
  title: {
    color: cssVar.cWhite,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    fontSize: cssVar.sXl,
  },
  topIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  notifButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cssVar.cBlack,
    borderRadius: 20,
    marginLeft: 12,
    alignSelf: 'flex-start',
    position: 'relative',
  },
  notifPoint: {
    position: 'absolute',
    top: -5,
    right: -2,
    borderRadius: 100,
    backgroundColor: cssVar.cError,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifPointNumber: {
    fontSize: cssVar.sXs,
    fontFamily: FONTS.bold,
    color: cssVar.cWhite,
    textAlign: 'center',
    lineHeight: 18,
  },
};
