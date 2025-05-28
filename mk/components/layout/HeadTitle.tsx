import React, {useCallback, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {TouchableOpacity, View, Text, Animated} from 'react-native';
import Icon from '../ui/Icon/Icon';
import {
  IconArrowLeft,
  IconMenu,
  IconNotification,
} from '../../../src/icons/IconLibrary';
// Avatar, getFullName, getUrlImages, useAuth, navigate, TextLog, getPercentajeUser no se usan directamente en este snippet
// pero se mantienen por si son usados por 'right' o 'customTitle' props.
// import Avatar from '../ui/Avatar/Avatar';
// import {getFullName, getUrlImages} from '../../utils/strings';
// import useAuth from '../../hooks/useAuth';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../styles/themes';
// import {getPercentajeUser, navigate} from '../../utils/utils';
// import TextLog from '../ui/TextLog/TextLog';
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
  // avatar?: boolean; // avatar prop no parece usarse
}

const HeadTitle = ({
  title,
  backUrl = '',
  style = {},
  customTitle = null,
  onBack = null,
  right,
  back = false, // 'back' prop se usa para determinar si mostrar la flecha de atrás
  // avatar = false,
  onlyBack = false,
}: HeadTitleProps) => {
  const navigation: any = useNavigation();
  const route = useRoute();
  // const {user} = useAuth(); // user no se usa directamente aquí
  const [counter, setCounter] = useState(0);

  const onNotif = useCallback((data: any) => {
    console.log('nueva counter', data);
    setCounter(old => old + 1);
  }, []);
  const onResetNotif = useCallback((data: any) => {
    console.log('nueva counter', data);
    setCounter(0);
  }, []);
  useEvent('onNotif', onNotif);
  useEvent('onResetNotif', onResetNotif);

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

  // const goProfile = () => { // No se usa
  //   navigation.navigate('profile');
  // };
  const togleDrawer = () => {
    navigation.toggleDrawer();
  };

  // Asumimos que el tamaño del icono es ~20px y el padding es 8px (theme.back)
  // Ancho efectivo del contenedor del icono = 20 + 2*8 = 36px.
  // Ajusta este valor si tus iconos o padding son diferentes.
  const effectiveIconContainerWidth = 36;
  const iconContainerBorderRadius = effectiveIconContainerWidth / 2;


  const renderLeftElement = () => {
    if (route.name === 'Home' && !onlyBack) {
      return (
        <TouchableOpacity onPress={togleDrawer} accessibilityLabel={'Abrir menú'}>
          <View
            style={{
              width: effectiveIconContainerWidth,
              height: effectiveIconContainerWidth,
              justifyContent: 'center',
              alignItems: 'center',
              // flexDirection: 'row', // No necesario para un solo icono centrado
              // alignItems: 'center', // Cubierto por alignItems en View
              padding: 8, // Mantenemos padding si el icono se ajusta dentro
              backgroundColor: cssVar.cWhite,
              borderRadius: iconContainerBorderRadius, 
            }}>
            <Icon name={IconMenu} color={cssVar.cBlack} />
          </View>
        </TouchableOpacity>
      );
    }
    // Mostrar flecha atrás si 'back' es true, o si no es Home, o si es Home con onlyBack
    if (back || route.name !== 'Home' || onlyBack) {
      return (
        <TouchableOpacity onPress={goBack} accessibilityLabel={'Volver atrás'}>
          <View style={theme.back}> 
            {/* theme.back ya tiene padding: 8. Asumimos que esto + icono = effectiveIconContainerWidth */}
            <Icon name={IconArrowLeft} color={cssVar.cWhite} />
          </View>
        </TouchableOpacity>
      );
    }
    // Si no hay nada a la izquierda por lógica, renderizar un espaciador para mantener equilibrio
    return <View style={{width: effectiveIconContainerWidth, height: effectiveIconContainerWidth}} />;
  };

  const renderRightElement = () => {
    if (right) {
      return <View>{right}</View>; // El usuario provee 'right', puede tener cualquier ancho
    }
    if (route.name === 'Home' && !onlyBack) {
      return (
        <TouchableOpacity onPress={() => navigation.navigate('Notificaciones')} accessibilityLabel={'Notificaciones'}>
          <View
            style={{
              width: effectiveIconContainerWidth,
              height: effectiveIconContainerWidth,
              justifyContent: 'center',
              alignItems: 'center',
              // flexDirection: 'row', // No necesario
              // alignItems: 'center', // Cubierto
              padding: 8,
              backgroundColor: cssVar.cWhite,
              borderRadius: iconContainerBorderRadius,
            }}>
            <Icon name={IconNotification} color={cssVar.cBlack} />
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
    // Espaciador si 'right' no fue provisto Y no es el icono de notificación de Home.
    // Esto cubre pantallas no-Home, y Home con 'onlyBack = true'.
    return <View style={{width: effectiveIconContainerWidth, height: effectiveIconContainerWidth}} />;
  };

  return (
    <Animated.View style={{...theme.container, ...style}}>
      {renderLeftElement()}

      {customTitle ? (
        <View style={theme.customTitle}>{customTitle}</View>
      ) : (
        <Text
          style={theme.title}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      )}
      {renderRightElement()}
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
    paddingHorizontal: cssVar.spS, // Aplicar padding horizontal aquí
    paddingVertical: cssVar.spS, // O un padding vertical si es necesario
    minHeight: 56, // Altura mínima para consistencia
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between', // Esto puede ayudar si los elementos laterales son fijos
  },
  back: { // Este estilo se usa para el contenedor del icono de flecha atrás
    padding: 8, // Si el icono es 20x20, esto hace el touch target 36x36
    // El ancho/alto implícito será el tamaño del icono + padding
    // No es necesario width/height explícito si el icono + padding dan el tamaño deseado
    justifyContent: 'center',
    alignItems: 'center',
  },
  customTitle: { // El contenedor del título personalizado
    flex: 1, // Que tome el espacio restante
    // Si customTitle es un Text, necesitaría textAlign: 'center'
    // Si es un View complejo, ese View debe manejar su propio centrado de texto
    marginHorizontal: cssVar.spXs, // Pequeño margen para que no toque los iconos
  },
  title: { // El componente Text del título
    flex: 1, // Que tome el espacio restante
    color: cssVar.cWhite,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    fontSize: cssVar.sXl,
    marginHorizontal: cssVar.spXs, // Pequeño margen para que no toque los iconos
  },
  // bage y textBage no se usan en el snippet, se dejan por si acaso.
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
  notifPoint: {
    position: 'absolute',
    top: -2, // Ajustado para mejor visualización
    right: -2, // Ajustado
    minWidth: 18, // Para que números pequeños se vean bien
    height: 18,
    borderRadius: 9, // Mitad de la altura/ancho
    backgroundColor: cssVar.cError,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4, // Padding para números más grandes
  },
  notifPointNumber: {
    fontSize: cssVar.sXs,
    fontFamily: FONTS.bold,
    color: cssVar.cWhite,
    textAlign: 'center',
  },
};