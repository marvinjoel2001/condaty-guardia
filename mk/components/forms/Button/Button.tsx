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
  const componentStyles = useMemo(() => {
    const viewStyle = {
      ...theme.button, // Estilos base del View interno
      ...theme[variant], // Estilos de la variante para el View interno
      ...(disabled || waiting > 0
        ? {
            ...theme.disabled, // Estilos de deshabilitado para el View interno
            borderColor:
              variant == 'secondary'
                ? cssVar.cWhiteV1
                : theme.button.borderColor, // Ajuste para mantener borde si es secundario
          }
        : {}),
      ...style,
    };

    const textStyle = {
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
  }, [styleText, variant, disabled, waiting]);
  const handlePress = (e: any) => {
    e.stopPropagation();
    if (!disabled && waiting <= 0) {
      onPress(e); // Ejecuta la acción del botón
    }
  };

  return (
    <View style={{height: 46, flexGrow: 1}} onTouchEnd={handlePress}>
      <TouchableOpacity
        disabled={disabled || waiting > 0}
        style={[componentStyles.view]}
        // onPress={handlePress}
      >
        <View pointerEvents={'none'}>
          {/* Corrección para el ícono: */}
          {icon !== null && typeof icon === 'string' ? (
            <Text style={componentStyles.text}>{icon}</Text>
          ) : (
            icon
          )}
          {children && (
            <Text
              style={{
                ...componentStyles.text,
                ...(icon !== null && {
                  marginLeft:
                    typeof icon === 'string' || React.isValidElement(icon)
                      ? cssVar.spS || 8
                      : 0,
                }), // cssVar.spS o un valor como 8
                ...(variant == 'terciary'
                  ? {
                      textDecorationLine: 'underline',
                      textDecorationStyle: 'solid',
                    }
                  : {}),
              }}>
              {children}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Button;

// Tu 'theme' existente (asegúrate que las rutas a cssVar, FONTS sean correctas)
const theme: ThemeType = {
  touchable: {
    borderRadius: cssVar.bRadiusS, // Mantenemos el borde redondeado si se aplica al touchable
    overflow: 'hidden',
  },
  text: {
    fontSize: cssVar.sL,
    fontFamily: FONTS.semiBold,
  },
  button: {
    // Estos son para el <View> interno
    padding: cssVar.spM,
    borderRadius: cssVar.bRadiusS,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: cssVar.bWidth,
    borderColor: cssVar.cAccent, // Este será el borde por defecto del View
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
