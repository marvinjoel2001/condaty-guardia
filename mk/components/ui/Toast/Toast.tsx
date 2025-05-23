import {useEffect, useRef} from 'react';
import {Text, View, Animated, Easing} from 'react-native';
import Icon from '../Icon/Icon';
import {
  IconX,
  IconSuccessToast,
  IconInfoToast,
} from '../../../../src/icons/IconLibrary';
import {cssVar, FONTS, ThemeType} from '../../../styles/themes';
import React from 'react';

type toastProps = {
  msg: string | null;
  type: 'success' | 'error' | 'warning' | 'info';
  time?: number;
  important?: boolean;
};

interface ToastProps {
  toast: toastProps;
  showToast: (param: string) => void;
}
export const TIME_TOAST = 3000;
const Toast = ({toast, showToast}: ToastProps) => {
  const translateY = useRef(new Animated.Value(-200)).current; // Inicia fuera de la pantalla

  const _close = () => {
    Animated.timing(translateY, {
      toValue: -200, // Se mueve fuera de la pantalla hacia abajo
      duration: 400,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      showToast('');
    });
  };

  useEffect(() => {
    if (toast?.msg && toast?.msg !== '') {
      Animated.timing(translateY, {
        toValue: 0, // Se mueve a la posición visible
        duration: 800,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        _close();
      }, toast?.time || TIME_TOAST);
    }
  }, [toast?.msg]);

  return (
    <View style={theme.container}>
      <Animated.View
        accessibilityLabel="Cerrar"
        onTouchStart={() => _close()}
        style={
          !toast?.msg || toast?.msg == ''
            ? theme.hidden
            : {
                ...theme.visible,
                // transform: [{translateY}],
                backgroundColor: cssVar.cWhite,
                pointerEvents: 'box-only',
              }
        }>
        <View style={theme.icon}>
          {toast?.type == 'success' && (
            <Icon name={IconSuccessToast} color={cssVar.cSuccess} />
          )}
          {toast?.type == 'error' && (
            <Icon name={IconX} color={cssVar.cError} />
          )}
          {toast?.type == 'warning' && (
            <Icon
              name={IconInfoToast}
              style={{transform: [{scaleY: -1}]}}
              color={cssVar.cWarning}
            />
          )}
          {toast?.type == 'info' && (
            <Icon name={IconInfoToast} color={cssVar.cInfo} />
          )}
        </View>
        <View style={theme.conntainerMessage}>
          <Text style={theme.message}>{toast?.msg}</Text>
        </View>
        {/* <View style={{position: 'absolute', right: 6, top: 2}}>
        <Icon name={IconX} color={cssVar.cWhite} />
      </View> */}
      </Animated.View>
    </View>
  );
};

export default Toast;
const theme: ThemeType = {
  hidden: {display: 'none', pointerEvents: 'box-only'},
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  visible: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    // position: 'absolute',
    // bottom: 30,
    // left: '50%',
    // transform: [{translateX: -155}],
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    // shadowOffset: {width: 0, height: 20},
    // shadowOpacity: 0.25,
    // elevation: 5,
    zIndex: 1000,
    maxWidth: 320,
    // width: 'auto',

    // height: 50,
  },
  icon: {
    // flexShrink: 1,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conntainerMessage: {
    paddingHorizontal: 8,
  },
  message: {
    fontSize: cssVar.sS,
    color: cssVar.cBlack,
    fontFamily: FONTS.medium,
  },
};
