import {useMemo} from 'react';
import {TouchableOpacity, Text, View} from 'react-native';
import useApi from '../../../hooks/useApi';
import {FONTS, ThemeType, TypeStyles, cssVar} from '../../../styles/themes';
import React from 'react';
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
  style = {},
  styleText = {},
  icon = null,
}: PropsType) => {
  const {waiting} = useApi();

  const styles = useMemo(() => {
    const button = {
      ...theme.button,
      ...theme[variant],
      ...(disabled || waiting > 0
        ? variant == 'terciary'
          ? {backgroundColor: 'transparent'}
          : theme.disabled
        : {}),
      ...style,
    };
    const text = {
      color: (theme[variant] as any).color || theme.button.color,
      ...theme.text,
      ...styleText,
      ...(disabled || waiting > 0
        ? {
            color:
              variant == 'terciary' ? cssVar.cBlackV2 : theme.disabled.color,
          }
        : {}),
    };

    return {button, text};
  }, [style, styleText, variant, disabled, waiting]);

  return (
    <TouchableOpacity
      disabled={disabled || waiting > 0}
      style={theme.touchable}>
      <View
        style={styles.button}
        pointerEvents={disabled || waiting > 0 ? 'none' : 'auto'}
        onTouchEnd={e => {
          if (waiting <= 0) onPress(e);
        }}>
        {icon}
        <Text
          style={{
            ...styles.text,
            ...(variant == 'terciary'
              ? {textDecorationLine: 'underline', textDecorationStyle: 'solid'}
              : {}),
          }}>
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default Button;

const theme: ThemeType = {
  touchable: {
    borderRadius: cssVar.bRadiusS,
    overflow: 'hidden',
  },
  text: {
    fontSize: cssVar.sL,
    fontFamily: FONTS.semiBold,
  },
  button: {
    padding: cssVar.spM,
    borderRadius: cssVar.bRadiusS,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: cssVar.bWidth,
    borderColor: cssVar.cAccent,
    color: cssVar.cBlack,
    backgroundColor: 'transparent',
  },
  primary: {
    backgroundColor: cssVar.cAccent,
    color: cssVar.cBlack,
  },
  secondary: {
    borderWidth: cssVar.bWidth,
    borderColor: cssVar.cBlackV2,
    color: cssVar.cBlackV2,
  },
  terciary: {
    padding: 0,
    borderWidth: 0,
    color: cssVar.cAccent,
  },
  disabled: {
    backgroundColor: cssVar.cBlackV2,
    borderColor: cssVar.cBlackV2,
    opacity: 0.6,
  },

  icon: {
    paddingHorizontal: cssVar.spS,
    paddingVertical: cssVar.spS,
    borderRadius: 100,
    fontSize: cssVar.sM,
    alignItems: 'center',
  },
};
