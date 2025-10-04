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
}

const HeadTitle = ({
  title,
  backUrl = '',
  style = {},
  customTitle = null,
  onBack = null,
  right,
  back = false,
  onlyBack = false,
  iconClose = true,
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

  const renderLeftComponent = () => {
    if (route.name === 'Home' && !onlyBack) {
      return (
        <TouchableOpacity onPress={togleDrawer}>
          <View style={theme.sideComponent}>
            <Icon name={IconMenu} color={cssVar.cWhite} />
          </View>
        </TouchableOpacity>
      );
    }
    if (iconClose) {
      return (
        <TouchableOpacity onPress={goBack} accessibilityLabel={'Volver atrás'}>
          <View style={theme.sideComponent}>
            <Icon name={IconArrowLeft} color={cssVar.cWhite} />
          </View>
        </TouchableOpacity>
      );
    }
    return <View style={theme.sideComponent} />;
  };

  const renderRightComponent = () => {
    if (selected?.cant > 0) {
      return (
        <View style={theme.rightContainer}>
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
      );
    }
    if (right) {
      return <View style={theme.sideComponent}>{right}</View>;
    }
    if (route.name === 'Home' && !onlyBack) {
      return (
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <View style={theme.sideComponent}>
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
      );
    }
    return <View style={theme.sideComponent} />;
  };

  return (
    <Animated.View style={{...theme.container, ...style}}>
      <View style={theme.leftContainer}>{renderLeftComponent()}</View>

      <View style={theme.titleContainer}>
        {customTitle ? (
          customTitle
        ) : (
          <Text style={theme.title} numberOfLines={1}>
            {selected?.cant === 0 ? title : `${selected?.cant} seleccionados`}
          </Text>
        )}
      </View>

      <View style={theme.rightSlotContainer}>{renderRightComponent()}</View>
    </Animated.View>
  );
};

export default HeadTitle;

const theme: ThemeType = {
  container: {
    width: '100%',
    backgroundColor: cssVar.cBlack,
    borderBottomWidth: 0.5,
    borderBottomColor: cssVar.cWhiteV1,
    paddingVertical: cssVar.spS,
    paddingHorizontal: cssVar.spS,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftContainer: {
    justifyContent: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rightSlotContainer: {
    justifyContent: 'flex-end',
  },
  sideComponent: {
    minWidth: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: cssVar.cWhite,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    fontSize: cssVar.sXl,
  },
  customTitle: {
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    height: 44,
  },
  notifPoint: {
    position: 'absolute',
    top: 5,
    right: 5,
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
  },
};
