import React, {useMemo} from 'react';
import {TouchableOpacity, Text, View} from 'react-native';
import useApi from '../../../hooks/useApi';
import {FONTS, ThemeType, TypeStyles, cssVar} from '../../../styles/themes';

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
  const componentStyles = useMemo(() => {
    const viewStyle = {
      ...theme.button,
      ...theme[variant],
      ...(disabled || waiting > 0
        ? {
            ...theme.disabled,
            borderColor:
              variant == 'secondary'
                ? cssVar.cWhiteV1
                : theme.button.borderColor,
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
      onPress(e);
    }
  };
  return (
    <View
      style={{
        width: '100%',
        flexShrink: waiting <= 0 && variant != 'terciary' ? 1 : 0,
      }}
      onTouchEnd={handlePress}>
      <TouchableOpacity
        disabled={disabled || waiting > 0}
        style={[componentStyles.view]}
        // onPress={handlePress}
      >
        <View
          style={{flexDirection: 'row', alignItems: 'center'}}
          pointerEvents={'none'}>
          {icon !== null && typeof icon === 'string' ? (
            <Text style={componentStyles.text}>{icon}</Text>
          ) : (
            icon
          )}

          <Text
            style={{
              ...componentStyles.text,
              ...(icon !== null && {
                marginLeft:
                  typeof icon === 'string' || React.isValidElement(icon)
                    ? cssVar.spS || 8
                    : 0,
              }),
              ...(variant == 'terciary'
                ? {
                    textDecorationLine: 'underline',
                    textDecorationStyle: 'solid',
                  }
                : {}),
            }}>
            {children}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
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
  },
  primary: {
    backgroundColor: cssVar.cAccent,
    color: cssVar.cBlack,
    borderColor: cssVar.cAccent,
  },
  secondary: {
    borderWidth: cssVar.bWidth,
    borderColor: cssVar.cWhiteV1,
    color: cssVar.cWhiteV1,
  },
  terciary: {
    padding: 0,
    borderWidth: 0,
    color: cssVar.cAccent,
    borderColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    paddingHorizontal: cssVar.spS,
    paddingVertical: cssVar.spS,
    borderRadius: 100,
    fontSize: cssVar.sM,
    alignItems: 'center',
  },
};
