import {useCallback, useEffect, useRef, useState, useContext} from 'react';
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Modal as ModalRN,
  Animated,
  BackHandler,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from '../Icon/Icon';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../../styles/themes';
import {AuthContext} from '../../../contexts/AuthContext';
import {IconX} from '../../../../src/icons/IconLibrary';
import Toast from '../Toast/Toast';
import Button from '../../forms/Button/Button';
import Form from '../../forms/Form/Form';
import React from 'react';
type PropsType = {
  children: any;
  onClose: (e: any) => void;
  open: boolean;
  onSave?: (e: any) => void;
  title?: string;
  style?: TypeStyles;
  buttonText?: string;
  buttonCancel?: string;
  buttonExtra?: any;
  id?: string;
  duration?: number;
  fullScreen?: boolean;
  iconClose?: boolean;
  disabled?: boolean;
  recursive?: boolean;
  headerStyles?: TypeStyles;
  containerStyles?: TypeStyles;
  overlayClose?: boolean;
};

const Modal = ({
  children,
  onClose,
  open,
  onSave = () => {},
  title = '',
  buttonText = '',
  buttonCancel = '',
  buttonExtra = null,
  id = '',
  fullScreen = false,
  iconClose = true,
  overlayClose = false,
  disabled = false,
  headerStyles = {},
  containerStyles = {},
}: PropsType) => {
  const screen = Dimensions.get('window');
  const {toast, showToast}: any = useContext(AuthContext);
  const [_open, setOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(200)).current;

  // BackHandler logic
  // useFocusEffect(
  //   useCallback(() => {
  //     const onBackPress = () => {
  //       if (open && fullScreen) {
  //         _onClose('back');
  //         return true; // Prevent default back behavior
  //       }
  //       return false; // Allow default back behavior if modal isn't open or fullscreen
  //     };

  //     BackHandler.addEventListener('hardwareBackPress', onBackPress);

  //     return () =>
  //       BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  //   }, [open, fullScreen]), // Dependencies ensure the effect is applied when these change
  // );

  useEffect(() => {
    if (open) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [open, fadeAnim]);

  useEffect(() => {
    setOpen(open);
  }, [open]);

  const _onClose = (e: any) => {
    onClose(e);
  };

  const _onOverlayPress = () => {
    if (!iconClose || !overlayClose) return;
    onClose('overlay');
  };

  return (
    <ModalRN
      animationType="fade"
      transparent={true}
      visible={open}
      onRequestClose={() => {}}>
      <Form>
        <TouchableOpacity
          activeOpacity={1}
          style={{...theme.overlay, opacity: fadeAnim}}
          onPress={_onOverlayPress}>
          <Animated.View
            style={{
              ...theme.container,
              ...containerStyles,
              width: screen.width - 80,
              opacity: fadeAnim,
            }}>
            {(iconClose || title) && (
              <View style={{...theme.header, ...headerStyles}}>
                {iconClose && (
                  <View style={{width: '100%', alignItems: 'flex-end'}}>
                    <TouchableOpacity onPress={() => _onClose('x')}>
                      <Icon name={IconX} color={cssVar.cWhite} />
                    </TouchableOpacity>
                  </View>
                )}
                {title && (
                  <Text style={{...theme.headerText, ...headerStyles}}>
                    {title}
                  </Text>
                )}
              </View>
            )}
            <ScrollView
              automaticallyAdjustContentInsets
              automaticallyAdjustKeyboardInsets={true}
              automaticallyAdjustsScrollIndicatorInsets
              bounces
              bouncesZoom
              keyboardDismissMode="interactive"
              canCancelContentTouches
              disableIntervalMomentum={true}
              style={theme.body}>
              {children}
            </ScrollView>
            <View style={theme.footer}>
              {buttonText && (
                <View style={{flexGrow: 1}}>
                  <Button
                    variant="primary"
                    disabled={disabled}
                    onPress={() => onSave(id)}>
                    {buttonText}
                  </Button>
                </View>
              )}
              {buttonCancel && (
                <View style={{flexGrow: 1}}>
                  <Button
                    variant="secondary"
                    onPress={() => _onClose('cancel')}>
                    {buttonCancel}
                  </Button>
                </View>
              )}
            </View>
            {buttonExtra && <View style={{flexGrow: 1}}>{buttonExtra}</View>}
          </Animated.View>
        </TouchableOpacity>
        <Toast toast={toast} showToast={showToast} />
      </Form>
    </ModalRN>
  );
};

export default Modal;

const theme: ThemeType = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'space-between',
    backgroundColor: cssVar.cBlack,
    borderRadius: cssVar.bRadiusS,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexShrink: 1,
    paddingHorizontal: cssVar.spL,
    paddingVertical: cssVar.spM,
  },
  headerText: {
    color: cssVar.cWhite,
    fontSize: cssVar.sL,
    fontFamily: FONTS.semiBold,
  },
  body: {
    flexGrow: 1,
    marginBottom: cssVar.spM,
    paddingHorizontal: cssVar.spM,
    width: '100%',
  },
  footer: {
    paddingTop: cssVar.spS,
    paddingHorizontal: cssVar.spM,
    gap: cssVar.spS,
    marginBottom: cssVar.spM,
  },
  buttonExtra: {
    paddingHorizontal: cssVar.spM,
    paddingBottom: cssVar.spS,
  },
};
