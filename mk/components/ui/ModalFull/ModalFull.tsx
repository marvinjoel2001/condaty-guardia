import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Text,
  Modal as ModalRN,
  View,
  ScrollView,
  SafeAreaView,
  Animated, // Importamos Animated
  Easing,
  Platform,
  RefreshControl,
  TouchableOpacity,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from '../Icon/Icon';
import {IconArrowLeft, IconSearch} from '../../../../src/icons/IconLibrary';
import Button from '../../forms/Button/Button';
import {AuthContext} from '../../../contexts/AuthContext';
import Toast from '../Toast/Toast';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../../styles/themes';
import Form from '../../forms/Form/Form';
import DataSearch from '../DataSearch';
import useAuth from '../../../hooks/useAuth';

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
  rightIconV2?: any;
  disabled?: boolean;
  enScroll?: boolean;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void; // Nuevo prop
  reload?: any;
  typeAnimation?: 'slide' | 'fade' | 'book'; // Añadimos 'book' como nuevo tipo de animación
  isMandatory?: boolean;
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
  rightIcon = false,
  rightIconV2,
  disabled = false,
  searchQuery = '',
  setSearchQuery = () => {},
  enScroll = false,
  reload = false,
  typeAnimation = 'fade', // El valor predeterminado es 'slide'
  isMandatory = false,
}: PropsType) => {
  const {toast, showToast}: any = useContext(AuthContext);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchButtonColor, setSearchButtonColor] = useState('transparent');
  const [iconButtonColor, setIconButtonColor] = useState('transparent');
  const scrollViewRef: any = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  // Creamos el valor animado
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

      // Interceptar el botón de volver atrás
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          // Evitar el comportamiento predeterminado
          return true; // Esto deshabilita el botón de atrás
        },
      );

      // Eliminar el listener cuando el modal se cierra
      return () => backHandler.remove();
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
        isMandatory ? null : onClose('x');
      }}>
      <SafeAreaView style={{flex: 1}}>
        <Form>
          <View
            style={{
              ...theme.header,
              paddingHorizontal: !iconClose ? cssVar.spM : 0,
              paddingBottom: !iconClose ? cssVar.spS : 0,
              borderBottomWidth: iconClose ? cssVar.bWidth : 0,
            }}>
            {((!isSearchActive && iconClose) || (iconClose && rightIconV2)) && (
              <TouchableOpacity
                onPress={() => onClose('x')}
                onPressIn={() => setIconButtonColor(cssVar.cHover)}
                onPressOut={() => setIconButtonColor('transparent')}
                style={{
                  height: Platform.OS === 'android' ? 36 : 44,
                  width: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: iconButtonColor,
                  borderRadius: 8,
                }}>
                <Icon
                  name={IconArrowLeft}
                  color={cssVar.cWhite}
                  onPress={() => onClose('x')}
                  accessibilityLabel="Cerrar"
                />
              </TouchableOpacity>
            )}

            {!isSearchActive && <Text style={theme.headerText}>{title}</Text>}

            {isSearchActive && !rightIconV2 && (
              <DataSearch
                setSearch={setSearchQuery}
                focus={true}
                name="Buscar"
                style={{
                  flexGrow: 1,
                  marginHorizontal: cssVar.spM,
                }}
                value={searchQuery}
                iconLeft={
                  <Icon
                    name={IconArrowLeft}
                    color={cssVar.cWhite}
                    onPress={() => setIsSearchActive(false)}
                  />
                }
              />
            )}

            {rightIcon && !isSearchActive && !rightIconV2 && (
              <TouchableOpacity
                onPress={() => setIsSearchActive(true)}
                onPressIn={() => setSearchButtonColor(cssVar.cHover)}
                onPressOut={() => setSearchButtonColor('transparent')}
                style={{
                  height: Platform.OS === 'android' ? 48 : 44,
                  width: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: searchButtonColor,
                  borderRadius: 8,
                }}>
                <Icon
                  name={IconSearch}
                  color={cssVar.cWhiteV1}
                  accessibilityLabel="Buscar"
                  onPress={() => setIsSearchActive(true)}
                />
              </TouchableOpacity>
            )}

            {rightIconV2 && rightIconV2}
          </View>

          <ScrollView
            ref={scrollViewRef}
            automaticallyAdjustContentInsets
            automaticallyAdjustKeyboardInsets={true}
            automaticallyAdjustsScrollIndicatorInsets
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
          {(buttonText || buttonCancel || buttonExtra) && (
            <View
              style={{
                ...theme.footer,
                borderTopWidth: buttonText ? cssVar.bWidth : 0,
              }}>
              {buttonText && (
                <View style={{paddingHorizontal: cssVar.spM}}>
                  <Button
                    variant="primary"
                    disabled={disabled}
                    onPress={() => {
                      Keyboard.dismiss();
                      onSave(id);
                    }}>
                    {buttonText}
                  </Button>
                </View>
              )}
              {buttonCancel && (
                <View style={{paddingHorizontal: cssVar.spM}}>
                  <Button
                    variant="secondary"
                    onPress={(e: any) => {
                      e.stopPropagation();
                      Keyboard.dismiss();
                      onClose('cancel');
                    }}>
                    {buttonCancel}
                  </Button>
                </View>
              )}
              {buttonExtra && (
                <View style={{paddingHorizontal: cssVar.spM}}>
                  {buttonExtra}
                </View>
              )}
            </View>
          )}
          <Toast toast={toast} showToast={showToast} />
        </Form>
      </SafeAreaView>
    </ModalRN>
  );
};

const theme: ThemeType = {
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
    paddingHorizontal: cssVar.spM,
    color: cssVar.cWhiteV3,
    width: '100%',
    flex: 1,
    backgroundColor: cssVar.cBlack,
    // shadowOffset: {width: 0, height: 2},
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
    // elevation: 10,
  },
  footer: {
    width: '100%',
    // backgroundColor: 'red',
    gap: cssVar.spS,
    paddingBottom: cssVar.spM,
    paddingTop: cssVar.spS,
    borderTopColor: cssVar.cBlackV3,
    backgroundColor: cssVar.cBlack,
  },
};

export default ModalFull;
