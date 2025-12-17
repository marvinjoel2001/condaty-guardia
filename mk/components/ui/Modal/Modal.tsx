import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
  memo,
} from 'react';
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  AccessibilityInfo,
  findNodeHandle,
  StyleSheet,
  useWindowDimensions,
  InteractionManager,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeOut,
  runOnJS,
} from 'react-native-reanimated';
import Icon from '../Icon/Icon';
import { cssVar, FONTS, ThemeType, TypeStyles } from '../../../styles/themes';
import { AuthContext } from '../../../contexts/AuthContext';
import { IconX } from '../../../../src/icons/IconLibrary';
import Toast from '../Toast/Toast';
import Button from '../../forms/Button/Button';
import Form from '../../forms/Form/Form';
import ModalRN, { ModalProps } from 'react-native-modal';

type PropsType = {
  children: React.ReactNode;
  onClose: (e: any) => void;
  open: boolean;
  onSave?: (e: any) => void;
  title?: string;
  style?: TypeStyles;
  buttonText?: string;
  buttonCancel?: string;
  buttonExtra?: React.ReactNode;
  id?: string;
  duration?: number;
  fullScreen?: boolean;
  iconClose?: boolean;
  disabled?: boolean;
  recursive?: boolean;
  headerStyles?: TypeStyles;
  containerStyles?: TypeStyles;
  overlayClose?: boolean;
  swipeToClose?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

const Modal = memo(
  ({
    children,
    onClose,
    open,
    onSave = () => {},
    title = '',
    buttonText = '',
    buttonCancel = '',
    buttonExtra = null,
    id = '',
    iconClose = true,
    overlayClose = false,
    disabled = false,
    headerStyles = {},
    containerStyles = {},
    swipeToClose = true,
    accessibilityLabel,
    accessibilityHint,
  }: PropsType) => {
    const screen = Dimensions.get('window');
    const { toast, showToast }: any = useContext(AuthContext);
    const modalRef = useRef<View>(null);
    const [focusTrapActive, setFocusTrapActive] = useState(false);

    // Animation values
    const modalScale = useSharedValue(0.9);
    const modalOpacity = useSharedValue(0);
    const overlayOpacity = useSharedValue(0);

    // Gesture handling
    const panGesture = Gesture.Pan()
      .enabled(swipeToClose)
      .onUpdate(event => {
        if (event.translationY > 0) {
          modalScale.value = 0.9 + (event.translationY / 300) * 0.1;
          overlayOpacity.value = Math.max(0, 1 - event.translationY / 200);
        }
      })
      .onEnd(event => {
        if (event.translationY > 100) {
          // Close modal with animation
          modalScale.value = withSpring(0.9);
          modalOpacity.value = withTiming(0);
          overlayOpacity.value = withTiming(0);
          runOnJS(onClose)('swipe');
        } else {
          // Reset position
          modalScale.value = withSpring(1);
          overlayOpacity.value = withTiming(1);
        }
      });

    // Animated styles
    const animatedModalStyle = useAnimatedStyle(() => ({
      transform: [{ scale: modalScale.value }],
      opacity: modalOpacity.value,
    }));

    const animatedOverlayStyle = useAnimatedStyle(() => ({
      opacity: overlayOpacity.value,
    }));

    // Handle reduced motion preference
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
      const subscription = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        setPrefersReducedMotion,
      );
      return () => subscription?.remove();
    }, []);

    // Modal open/close animations
    useEffect(() => {
      if (open) {
        modalOpacity.value = withTiming(1, {
          duration: prefersReducedMotion ? 0 : 300,
        });
        overlayOpacity.value = withTiming(1, {
          duration: prefersReducedMotion ? 0 : 300,
        });
        modalScale.value = withSpring(1, {
          damping: 25,
          stiffness: 500,
        });

        // Accessibility announcement
        setTimeout(() => {
          AccessibilityInfo.announceForAccessibility(
            `Modal opened: ${accessibilityLabel || title || 'Dialog'}`,
          );
        }, 100);

        // Focus trap management
        InteractionManager.runAfterInteractions(() => {
          setFocusTrapActive(true);
          if (modalRef.current) {
            const nodeHandle = findNodeHandle(modalRef.current);
            if (nodeHandle) {
              AccessibilityInfo.setAccessibilityFocus(nodeHandle);
            }
          }
        });
      } else {
        modalOpacity.value = withTiming(0, {
          duration: prefersReducedMotion ? 0 : 200,
        });
        overlayOpacity.value = withTiming(0, {
          duration: prefersReducedMotion ? 0 : 200,
        });
        modalScale.value = withSpring(0.9);
        setFocusTrapActive(false);
      }
    }, [open, prefersReducedMotion, accessibilityLabel, title]);

    const _onClose = useCallback(
      (e: any) => {
        onClose(e);
      },
      [onClose],
    );

    const _onOverlayPress = useCallback(() => {
      if (!iconClose || !overlayClose) return;
      onClose('overlay');
    }, [iconClose, overlayClose, onClose]);

    if (!open) return null;

    return (
      <ModalRN
        style={styles.modal}
        isVisible={open}
        onBackdropPress={_onOverlayPress}
        onBackButtonPress={() => _onClose('backButton')}
        hasBackdrop={false}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        supportedOrientations={['portrait', 'landscape']}
        statusBarTranslucent
        accessibilityViewIsModal
        accessibilityLabel={accessibilityLabel || title || 'Modal dialog'}
        accessibilityHint={
          accessibilityHint ||
          'Use swipe down to close or tap outside to dismiss'
        }
        onModalShow={() => setFocusTrapActive(true)}
        onModalHide={() => setFocusTrapActive(false)}
      >
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
            <TouchableOpacity
              activeOpacity={1}
              // style={styles.overlayTouchable}
              onPress={_onOverlayPress}
              accessible={false}
            >
              <Animated.View
                ref={modalRef}
                style={[styles.container, animatedModalStyle, containerStyles]}
                accessibilityLabel={
                  accessibilityLabel || title || 'Modal dialog'
                }
                accessibilityHint={accessibilityHint}
              >
                <Form>
                  {(iconClose || title) && (
                    <View style={[styles.header, headerStyles]}>
                      {title && (
                        <Text
                          style={[styles.headerText, headerStyles]}
                          accessibilityRole="header"
                        >
                          {title}
                        </Text>
                      )}
                      {iconClose && (
                        <View
                        // style={styles.closeButtonContainer}
                        >
                          <TouchableOpacity
                            onPress={() => _onClose('closeButton')}
                            accessibilityRole="button"
                            accessibilityLabel="Close modal"
                            accessibilityHint="Double tap to close modal"
                          >
                            <Icon name={IconX} color={cssVar.cWhite} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}

                  <ScrollView
                    style={styles.body}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={16}
                    accessible={false}
                    automaticallyAdjustContentInsets
                    automaticallyAdjustKeyboardInsets={true}
                    automaticallyAdjustsScrollIndicatorInsets
                    bounces
                    bouncesZoom
                    keyboardDismissMode="interactive"
                    canCancelContentTouches
                    disableIntervalMomentum={true}
                  >
                    <View accessible={false}>{children}</View>
                  </ScrollView>

                  {(buttonText || buttonCancel || buttonExtra) && (
                    <View style={styles.footer}>
                      {buttonText && (
                        <Button
                          variant="primary"
                          disabled={disabled}
                          onPress={() => onSave(id)}
                        >
                          {buttonText}
                        </Button>
                      )}
                      {buttonCancel && (
                        <Button
                          variant="secondary"
                          onPress={() => _onClose('cancel')}
                        >
                          {buttonCancel}
                        </Button>
                      )}
                      {buttonExtra && (
                        <View style={styles.buttonExtra}>{buttonExtra}</View>
                      )}
                    </View>
                  )}
                </Form>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>

        <Toast toast={toast} showToast={showToast} />
      </ModalRN>
    );
  },
);

Modal.displayName = 'Modal';

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

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    margin: 0,
  },
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
    backgroundColor: 'red', // cssVar.cBlack,
    borderRadius: cssVar.bRadiusS,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 10,
    height: '80%',
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
});

export default Modal;
