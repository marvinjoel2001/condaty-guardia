import React, {useMemo} from 'react'; // Asegúrate de que React esté importado si no lo estaba explícitamente
import {TouchableOpacity, Text, View} from 'react-native';
import useApi from '../../../hooks/useApi'; // Ajusta la ruta si es necesario
import {FONTS, ThemeType, TypeStyles, cssVar} from '../../../styles/themes'; // Ajusta la ruta si es necesario

interface PropsType {
  onPress: Function;
  disabled?: boolean;
  children: any;
  style?: TypeStyles;
  styleText?: TypeStyles;
  icon?: any;
  variant?:
    | 'primary'
    | 'secondary'
    | 'terciary'
    | 'icon'
    | 'disabled'
    | 'secondaryDisabled';
}

const Button = ({
  onPress,
  disabled = false,
  children,
  variant = 'primary',
  style = {}, // Esta prop 'style' viene de Profile.js
  styleText = {},
  icon = null,
}: PropsType) => {
  const {waiting} = useApi();

  // 1. Separa los estilos de layout (flex, márgenes) de los estilos visuales
  //    que vienen en la prop 'style'.
  const {
    // Propiedades de Flexbox para el contenedor TouchableOpacity
    flex,
    flexGrow,
    flexShrink,
    flexBasis,
    alignSelf,
    // Márgenes para el contenedor TouchableOpacity
    margin,
    marginVertical,
    marginHorizontal,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    // Podrías incluir width, height si alguna vez los pasas para el contenedor del botón
    // width,
    // height,
    ...visualStyle // El resto son estilos visuales para el <View> interno
  } = style;

  const componentStyles = useMemo(() => { // Renombrado para claridad, antes 'styles'
    const viewStyle = { // Estilos para el <View> interno
      ...theme.button, // Estilos base del View interno
      ...theme[variant], // Estilos de la variante para el View interno
      ...(disabled || waiting > 0
        ? {
            ...theme.disabled, // Estilos de deshabilitado para el View interno
            borderColor:
              variant == 'secondary' ? cssVar.cWhiteV1 : theme.button.borderColor, // Ajuste para mantener borde si es secundario
          }
        : {}),
      ...visualStyle, // Aplica solo los estilos visuales restantes al View
    };

    const textStyle = { // Estilos para el <Text>
      // Tu lógica de textStyle estaba bien, la copiamos aquí
      color: (theme[variant] as any).color || theme.button.color,
      ...theme.text,
      ...styleText,
      ...(disabled || waiting > 0
        ? {
            color:
              variant == 'terciary' || variant == 'secondary'
                ? cssVar.cWhiteV1
                : theme.disabled.color,
          }
        : {}),
    };

    return {view: viewStyle, text: textStyle};
  }, [visualStyle, styleText, variant, disabled, waiting]); // Depende de visualStyle

  // 2. Construye el estilo para TouchableOpacity, combinando theme.touchable con los estilos de layout extraídos
  const touchableCombinedStyle = {
    ...theme.touchable,
    ...(flex !== undefined && { flex }),
    ...(flexGrow !== undefined && { flexGrow }),
    ...(flexShrink !== undefined && { flexShrink }),
    ...(flexBasis !== undefined && { flexBasis }),
    ...(alignSelf !== undefined && { alignSelf }),
    ...(margin !== undefined && { margin }),
    ...(marginVertical !== undefined && { marginVertical }),
    ...(marginHorizontal !== undefined && { marginHorizontal }),
    ...(marginTop !== undefined && { marginTop }),
    ...(marginBottom !== undefined && { marginBottom }),
    ...(marginLeft !== undefined && { marginLeft }),
    ...(marginRight !== undefined && { marginRight }),
    // ...(width !== undefined && { width }),
    // ...(height !== undefined && { height }),
  };

  return (
    <TouchableOpacity
      disabled={disabled || waiting > 0}
      style={touchableCombinedStyle}
      onPress={e => {
        if (!disabled && waiting <= 0) onPress(e);
      }}
      activeOpacity={0.7}
      >
      <View
        style={componentStyles.view}
        pointerEvents={'none'}
        >
        {/* Corrección para el ícono: */}
        {icon !== null && typeof icon === 'string' ? (
          <Text style={componentStyles.text}>{icon}</Text> // Si es string, envuélvelo en Text
        ) : (
          icon // Si es un componente React (o null), rénderízalo directamente
        )}

        {/* Texto principal (children) */}
        {/* Verifica si children existe antes de renderizar el Text y añade margen si hay ícono */}
        {children && (
          <Text
            style={{
              ...componentStyles.text,
              // Añade un margen a la izquierda del texto si hay un ícono presente
              ...(icon !== null && { marginLeft: typeof icon === 'string' || React.isValidElement(icon) ? (cssVar.spS || 8) : 0 }), // cssVar.spS o un valor como 8
              ...(variant == 'terciary'
                ? {textDecorationLine: 'underline', textDecorationStyle: 'solid'}
                : {}),
            }}>
            {children}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default Button;

// Tu 'theme' existente (asegúrate que las rutas a cssVar, FONTS sean correctas)
const theme: ThemeType = {
  touchable: {
    borderRadius: cssVar.bRadiusS, // Mantenemos el borde redondeado si se aplica al touchable
    overflow: 'hidden', // Importante si el View interno tiene backgroundColor y borderRadius diferentes
    // justifyContent: 'center', // Si quieres que el contenido interno se centre verticalmente en el touchable
    // alignItems: 'center', // Si quieres que el contenido interno se centre horizontalmente
                            // Estas dos últimas usualmente van en el View interno si el touchable es flexible.
  },
  text: {
    fontSize: cssVar.sL,
    fontFamily: FONTS.semiBold,
  },
  button: { // Estos son para el <View> interno
    padding: cssVar.spM,
    borderRadius: cssVar.bRadiusS,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: cssVar.bWidth,
    borderColor: cssVar.cAccent, // Este será el borde por defecto del View
    // color: cssVar.cBlack, // 'color' en un View no tiene efecto, se aplica al Text
    // backgroundColor: 'transparent', // El View interno podría ser transparente y el TouchableOpacity tener el fondo
                                    // o viceversa, dependiendo del efecto deseado.
                                    // Por ahora, la variante pondrá el backgroundColor en el View.
  },
  primary: {
    backgroundColor: cssVar.cAccent,
    color: cssVar.cBlack, // color para el texto de la variante primaria
    borderColor: cssVar.cAccent, // Asegurar que el borde coincida
  },
  secondary: {
    // backgroundColor: 'transparent', // El View interno es transparente
    borderWidth: cssVar.bWidth,
    borderColor: cssVar.cWhiteV1,
    color: cssVar.cWhiteV1, // color para el texto de la variante secundaria
  },
  terciary: {
    padding: 0,
    borderWidth: 0,
    color: cssVar.cAccent, // color para el texto
    borderColor: 'transparent',
  },
  disabled: {
    opacity: 0.5, // Aplicar opacidad es una forma común de deshabilitar visualmente
                  // El borderColor en disabled se maneja en useMemo para casos específicos
  },
  icon: {
    paddingHorizontal: cssVar.spS,
    paddingVertical: cssVar.spS,
    borderRadius: 100, // Esto es para un botón completamente redondo tipo ícono
    fontSize: cssVar.sM, // Esto es para el texto, no para el botón en sí
    alignItems: 'center',
    // borderWidth: 0, // Usualmente los botones de ícono no tienen borde
  },
};