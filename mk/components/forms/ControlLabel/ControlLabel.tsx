import {View, Text, KeyboardTypeOptions} from 'react-native';
import {FONTS, ThemeType, TypeStyles, cssVar} from '../../../styles/themes';
import React from 'react';

export interface PropsTypeInputBase {
  name: string;
  value: string;
  type?: string;
  label?: string;
  placeholder?: string;
  error?: any;
  style?: TypeStyles;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  tabIndex?: number;
  autoFocus?: boolean;
  icon?: any;
  keyboardType?: KeyboardTypeOptions | undefined;
  onChange?: (e: any) => void;
  onKeyPress?: (e: any) => void;
  onBlur?: (e: any) => void;
  onFocus?: (e: any) => void;
  onSearch?: () => void;
  isFocus?: boolean;
  iconLeft?: any;
  iconRight?: any;
  maxLength?: number;
  search?: any;
  autoComplete?: any;
  password?: boolean;
  autoCapitalize?: any;
  multiline?: boolean;
}

interface PropsType extends PropsTypeInputBase {
  children?: any;
}
const ControlLabel = ({
  name,
  label = undefined,
  isFocus = false,
  disabled = false,
  required,
  maxLength = 140,
  value = '',
  error = null,
  type = 'text',
  children,
  placeholder = '',
  iconLeft = null,
  iconRight = null,
}: PropsType) => {
  const styleLabel = {
    ...theme.label,
    ...(!isFocus && iconLeft && !value ? {paddingLeft: cssVar.spM} : {}),
    ...(!isFocus && iconRight && !value ? {paddingRight: cssVar.spM} : {}),
    ...(isFocus || value || placeholder
      ? {...theme.focus, left: iconLeft ? 24 : 8}
      : {}),
    ...(error?.[name] ? {color: cssVar.cError} : {}),
    ...(disabled ? theme.disabled : {}),
  };
  const _label =
    label +
    ' ' +
    (required ? '*' : required === false || disabled ? '' : '(opcional)');
  return (
    <View style={theme.container}>
      {iconLeft && <View style={theme.iconLeft}>{iconLeft}</View>}
      {type !== 'hidden' && label && (
        <View pointerEvents={'none'} style={{zIndex: 1}}>
          <Text style={styleLabel}>{_label}</Text>
        </View>
      )}
      {children}
      {type !== 'hidden' && error != null && (
        <View style={theme.viewBottom}>
          <Text style={theme.error}>{error[name]}</Text>
          {type == 'textArea' && (
            <Text
              style={{
                ...theme.textLength,
                color:
                  maxLength <= (value + '').length
                    ? cssVar.cError
                    : cssVar.cBlack,
              }}>
              {(value + '').length} / {maxLength}
            </Text>
          )}
        </View>
      )}
      {iconRight && <View style={theme.iconRight}>{iconRight}</View>}
    </View>
  );
};

export default ControlLabel;

const theme: ThemeType = {
  container: {
    position: 'relative',

  },
  label: {
    color: cssVar.cWhiteV2,
    left: 16,
    fontSize: cssVar.sM,
    fontFamily: FONTS.regular,
    position: 'absolute',
    zIndex: 1,
    // transform: [{translateY: 18}],
    top: 18,
    pointerEvents: 'none',
  },
  focus: {
    fontSize: cssVar.sXs,
    fontFamily: FONTS.regular,
    position: 'absolute',
    color: cssVar.cAccent,
    zIndex: 1,
    // transform: [{translateY: 10}],
    top: 10,
    paddingHorizontal: cssVar.spXs,
  },
  error: {
    marginHorizontal: cssVar.spS,

    fontSize: cssVar.sXs,
    color: cssVar.cError,
    fontFamily: FONTS.medium,
  },
  textLength: {
    fontSize: cssVar.sXs,
    fontFamily: FONTS.regular,
    textAlign: 'right',
    marginBottom: cssVar.spS,
  },
  viewBottom: {
    flexDirection: 'row',
    width: '100%',
  },
  iconLeft: {
    position: 'absolute',
    left: 0,
    top: 18,
    marginLeft: 4,
  },
  iconRight: {
    position: 'absolute',
    right: 4,
    top: 18,
    marginRight: 4,
  },
};
