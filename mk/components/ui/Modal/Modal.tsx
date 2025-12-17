import { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
  InteractionManager,
} from 'react-native';
import Icon from '../Icon/Icon';
import { cssVar, FONTS, ThemeType, TypeStyles } from '../../../styles/themes';
import { AuthContext } from '../../../contexts/AuthContext';
import { IconX } from '../../../../src/icons/IconLibrary';
import Toast from '../Toast/Toast';
import Button from '../../forms/Button/Button';
import Form from '../../forms/Form/Form';
import React from 'react';
import ModalRN from 'react-native-modal';
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
  // fullScreen = false,
  iconClose = true,
  overlayClose = false,
  disabled = false,
  headerStyles = {},
  containerStyles = {},
}: PropsType) => {
  const screen = Dimensions.get('window');
  const { toast, showToast }: any = useContext(AuthContext);
  const [focusTrapActive, setFocusTrapActive] = useState(false);

  // Modal open/close animations
  useEffect(() => {
    if (open) {
      // Focus trap management
      InteractionManager.runAfterInteractions(() => {
        setFocusTrapActive(true);
      });
    } else {
      setFocusTrapActive(false);
    }
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
      style={{ margin: 0 }}
      isVisible={open}
      onBackdropPress={() => _onClose('overlay')}
      onBackButtonPress={() => _onClose('x')}
      hasBackdrop
      customBackdrop={<View style={theme.overlay} />}
      backdropOpacity={0}
      animationIn="fadeIn"
      animationOut="fadeOut"
      onModalShow={() => setFocusTrapActive(true)}
      onModalHide={() => setFocusTrapActive(false)}
    >
      <Form>
        <TouchableOpacity
          activeOpacity={1}
          style={{ ...theme.overlay }}
          onPress={_onOverlayPress}
        >
          <View
            style={{
              ...theme.container,
              ...containerStyles,
              width: screen.width - 12,
            }}
          >
            {(iconClose || title) && (
              <View style={{ ...theme.header, ...headerStyles }}>
                {title && (
                  <Text style={{ ...theme.headerText, ...headerStyles }}>
                    {title}
                  </Text>
                )}
                {iconClose && (
                  <View style={{ alignItems: 'flex-end' }}>
                    <TouchableOpacity onPress={() => _onClose('x')}>
                      <Icon name={IconX} color={cssVar.cWhite} />
                    </TouchableOpacity>
                  </View>
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
              style={theme.body}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              accessible={false}
            >
              {children}
            </ScrollView>
            {(buttonText || buttonCancel || buttonExtra) && (
              <View style={theme.footer}>
                {buttonText && (
                  // <View style={{flexGrow: 1}}>
                  <Button
                    variant="primary"
                    disabled={disabled}
                    onPress={() => onSave(id)}
                  >
                    {buttonText}
                  </Button>
                  // </View>
                )}
                {buttonCancel && (
                  // <View style={{flexGrow: 1, flexBasis: 0}}>
                  <Button
                    variant="secondary"
                    onPress={() => _onClose('cancel')}
                  >
                    {buttonCancel}
                  </Button>
                  // </View>
                )}
                {buttonExtra && (
                  <View style={{ flexGrow: 1 }}>{buttonExtra}</View>
                )}
              </View>
            )}
          </View>
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
    backgroundColor: '#161616E6',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomColor: cssVar.cWhiteV1,
    borderBottomWidth: 0.5,
  },
  headerText: {
    color: cssVar.cWhite,
    fontSize: cssVar.sL,
    fontFamily: FONTS.semiBold,
  },
  body: {
    flexGrow: 1,
    // marginBottom: cssVar.spM,
    paddingHorizontal: cssVar.spM,
    paddingVertical: cssVar.spM,
    width: '100%',
  },
  footer: {
    padding: cssVar.spS,
    gap: cssVar.spS,
    borderTopColor: cssVar.cWhiteV1,
    borderTopWidth: 0.5,
  },
  buttonExtra: {
    paddingHorizontal: 12,
    paddingBottom: cssVar.spS,
  },
};
