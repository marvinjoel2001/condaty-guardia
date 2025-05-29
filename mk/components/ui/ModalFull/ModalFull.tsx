import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Modal as ModalRN,
  View,
  ScrollView,
  SafeAreaView,
  Animated,
  Easing,
  RefreshControl,
  Keyboard,
} from 'react-native';
import Button from '../../forms/Button/Button';
import {AuthContext} from '../../../contexts/AuthContext';
import Toast from '../Toast/Toast';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../../styles/themes';
import Form from '../../forms/Form/Form';
import HeadTitle from '../../layout/HeadTitle';

type PropsType = {
  children: any;
  onClose: (e: any) => void;
  open: boolean;
  onSave?: (e: any) => void;
  title?: any;
  style?: TypeStyles;
  buttonText?: string;
  buttonCancel?: string;
  buttonExtra?: any;
  id?: string;
  iconClose?: boolean;
  rightIcon?: boolean;
  disabled?: boolean;
  enScroll?: boolean;
  reload?: any;
  typeAnimation?: 'slide' | 'fade' | 'book'; // Añadimos 'book' como nuevo tipo de animación
  scrollViewHide?: boolean;
  onBack?: () => void;
  headerHide?: boolean;
};

const ModalFull = ({
  children,
  onClose,
  open,
  onSave = () => {},
  title = '',
  style = {},
  buttonText = '',
  buttonCancel = '',
  buttonExtra = null,
  id = '',
  iconClose = true,
  disabled = false,
  enScroll = false,
  reload = false,
  typeAnimation = 'fade', // El valor predeterminado es 'slide'
  scrollViewHide = false,
  headerHide = false,
  rightIcon = false,
  onBack,
}: PropsType) => {
  const {toast, showToast}: any = useContext(AuthContext);
  const scrollViewRef: any = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const translateX = useRef(new Animated.Value(500)).current; // Valor inicial fuera de la pantalla (derecha)

  useEffect(() => {
    if (open) {
      if (enScroll) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({animated: false});
        }, 100);
      }
      // Animación de apertura
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      // Animación de cierre
      Animated.timing(translateX, {
        toValue: 500,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        onClose('x');
      });
    }
  }, [open, children]);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <ModalRN
      animationType={typeAnimation === 'book' ? 'none' : typeAnimation}
      transparent={true}
      visible={open}
      presentationStyle="overFullScreen"
      onRequestClose={() => {
        iconClose ? null : onClose('x');
      }}>
      <SafeAreaView style={{flex: 1}}>
        <Form>
          <Animated.View
            style={{
              ...theme.container,
              transform: typeAnimation === 'book' ? [{translateX}] : [], // Aplicamos la animación de deslizamiento
            }}>
            {!headerHide && (
              <HeadTitle
                title={title}
                onBack={onBack ? onBack : () => onClose('x')}
                onlyBack={open}
                right={rightIcon}
              />
            )}
            {scrollViewHide ? (
              children
            ) : (
              <ScrollView
                ref={scrollViewRef}
                // automaticallyAdjustContentInsets
                // automaticallyAdjustKeyboardInsets={true}
                // automaticallyAdjustsScrollIndicatorInsets
                refreshControl={
                  reload ? (
                    <RefreshControl
                      progressBackgroundColor={cssVar.cBlack}
                      colors={[cssVar.cAccent]}
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      tintColor={cssVar.cAccent}
                    />
                  ) : undefined
                }
                style={{
                  ...theme.body,
                  ...style,
                }}>
                {children}
              </ScrollView>
            )}
            {(buttonText || buttonCancel || buttonExtra) && (
              <View
                style={{
                  ...theme.footer,
                  borderTopWidth: cssVar.bWidth,
                }}>
                {buttonText && (
                  // <View style={{paddingHorizontal: cssVar.spM}}>
                  <Button
                    variant="primary"
                    disabled={disabled}
                    style={{flexGrow: 1, flexBasis: 0}}
                    onPress={() => {
                      Keyboard.dismiss();
                      onSave(id);
                    }}>
                    {buttonText}
                  </Button>
                  // </View>
                )}
                {buttonCancel && (
                  // <View style={{paddingHorizontal: cssVar.spM}}>
                  <Button
                    variant="secondary"
                    style={{flexGrow: 1, flexBasis: 0}}
                    onPress={(e: any) => {
                      e.stopPropagation();
                      Keyboard.dismiss();
                      onClose('cancel');
                    }}>
                    {buttonCancel}
                  </Button>
                  // </View>
                )}
                {buttonExtra && (
                  // <View style={{paddingHorizontal: cssVar.spM}}>
                  <View style={{flexGrow: 1, flexBasis: 0}}>{buttonExtra}</View>
                )}
              </View>
            )}
          </Animated.View>
        </Form>
        <Toast toast={toast} showToast={showToast} />
      </SafeAreaView>
    </ModalRN>
  );
};

const theme: ThemeType = {
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: cssVar.cBlack,
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
    // elevation: 10,
    overflow: 'hidden',
    // alignItems: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: cssVar.cBlack,
    borderBottomWidth: cssVar.bWidth,
    borderBottomColor: cssVar.cBlackV3,
  },
  headerText: {
    color: cssVar.cWhite,
    fontSize: cssVar.sL,
    fontFamily: FONTS.bold,
    flexGrow: 1,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: cssVar.spM,
    color: cssVar.cWhiteV3,
    width: '100%',
  },
  footer: {
    width: '100%',
    gap: cssVar.spS,
    marginBottom: cssVar.spM,
    paddingTop: cssVar.spS,
    borderTopColor: cssVar.cBlackV3,
    flexDirection: 'row-reverse',
    paddingHorizontal: cssVar.spM,
  },
};

export default ModalFull;
