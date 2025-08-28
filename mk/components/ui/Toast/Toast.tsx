import React, {useEffect, useRef} from 'react';
import {Text, View, Animated, Easing, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from '../Icon/Icon';
import {
  IconX,
  IconSuccessToastNotCircle,
  IconInfoToast,
  IconSuccessToast,
  IconToastSuccess,
  IconToastWarning,
  IconToastWarning2,
  IconAlert,

} from '../../../../src/icons/IconLibrary';
import {cssVar, FONTS} from '../../../styles/themes';

type toastProps = {
  msg: string | null;
  type: 'success' | 'error' | 'warning' | 'info';
  time?: number;
  important?: boolean;
  title?: string;
};

interface ToastProps {
  toast: toastProps;
  showToast: (param: string | null) => void;
}

export const TIME_TOAST = 300;

const Toast = ({toast, showToast}: ToastProps) => {
  const translateY = useRef(new Animated.Value(-200)).current;

  const _close = () => {
    Animated.timing(translateY, {
      toValue: -200,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      if (toast?.msg) {
        showToast(null);
      }
    });
  };

  useEffect(() => {
    if (toast?.msg) {
      translateY.setValue(-200);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
        tension: 60,
      }).start();

      const timer = setTimeout(() => {
        _close();
      }, toast?.time || TIME_TOAST);
      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast?.msg, toast?.time]);

  const getThemeStyles = () => {
    switch (toast?.type) {
      case 'success':
        return {
          iconName: IconToastSuccess,
          iconColor: cssVar.cWhite,
          iconBackgroundColor: cssVar.cSuccess || '#2A8A46',
          toastBackgroundColor: cssVar.cSuccess || '#2A8A46',
          textColor: cssVar.cWhite,
          defaultTitle: '¡Excelente!',
        };
      case 'error':
        return {
          iconName:  IconX,
          iconColor: cssVar.cWhite,
          iconBackgroundColor: cssVar.cError  || '#E53935',
          toastBackgroundColor: cssVar.cError || '#E53935',
          textColor: cssVar.cWhite,
          defaultTitle: 'Error',
        };
      case 'warning':
        return {
          iconName: IconToastWarning,
          iconColor: cssVar.cWhite,
          iconBackgroundColor: cssVar.cWarning || '#D4A017',
          toastBackgroundColor: cssVar.cWarning || '#FFB300',
          textColor: cssVar.cWhite,
          defaultTitle: 'Advertencia',
        };
      case 'info':
        return {
          iconName: IconInfoToast,
          iconColor: cssVar.cWhite,
          iconBackgroundColor: cssVar.cInfo || '#4285FA',
          toastBackgroundColor: cssVar.cInfo || '#2196F3',
          textColor: cssVar.cWhite,
          defaultTitle: 'Información',
        };
      default:
        return {
          iconName: IconInfoToast,
          iconColor: cssVar.cWhite,
          iconBackgroundColor: cssVar.cWhiteV1 || '#5F6368',
          toastBackgroundColor: cssVar.cWhiteV1 || '#9E9E9E',
          textColor: cssVar.cWhite,
          defaultTitle: 'Mensaje',
        };
    }
  };

  const theme = getThemeStyles();
  const currentTitle = toast?.title || theme.defaultTitle;

  if (!toast?.msg) {
    return null;
  }

  return (
    <View style={styles.outerContainer}>
      <Animated.View style={{transform: [{translateY}]}}>
        {/* CONTENEDOR DEL TOAST CON ÍCONO INTERNO */}
        <View style={[styles.toastBaseContainer, {backgroundColor: cssVar.cToastFill}]}>
          {/* ÍCONO DENTRO DEL TOAST */}
          <View style={[styles.iconInnerCircle, {backgroundColor: theme.iconBackgroundColor}]}>
            <Icon name={theme.iconName} color={theme.iconColor} size={24} />
          </View>

          <View style={styles.textContentWrapper}>
            <Text style={[styles.titleText, {color: theme.textColor}]}>{currentTitle}</Text>
            <Text style={[styles.messageText, {color: theme.textColor}]}>{toast.msg}</Text>
          </View>

          <TouchableOpacity onPress={_close} style={styles.closeButtonWrapper}>
            <Icon name={IconX} size={24} color={theme.textColor} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default Toast;

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  toastBaseContainer: {
    width: '100%',
    maxWidth: 340,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 12,
    marginTop: 50,
    // Sombra sutil para el toast
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  // ÍCONO AHORA DENTRO DEL TOAST
  iconInnerCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    // Sombra para el ícono
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  textContentWrapper: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  titleText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    marginBottom: 2,
  },
  messageText: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    flexShrink: 1,
  },
  closeButtonWrapper: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    padding: 4,
  },
});
