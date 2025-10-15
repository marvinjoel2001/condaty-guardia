import React, {useState, useMemo, useCallback} from 'react';
import {Platform, TextInput} from 'react-native';
import ControlLabel, {PropsTypeInputBase} from '../ControlLabel/ControlLabel';
import {cssVar, FONTS, ThemeType} from '../../../styles/themes';

interface PropsType extends PropsTypeInputBase {
  passwordMaxLength?: number;
  ciMaxLength?: number;
  iconLeft?: any;
  iconRight?: any;
}

// Definir theme ANTES de usarlo en el componente
const theme: ThemeType = {
  form: {
    color: cssVar.cWhiteV3,
  },
  default: {
    borderWidth: cssVar.bWidth,
    borderColor: cssVar.cWhiteV2,
    borderRadius: cssVar.bRadiusS,
    fontSize: cssVar.sM,
    fontFamily: FONTS.regular,
    backgroundColor: cssVar.cWhiteV2,
    color: cssVar.cWhite,
    paddingBottom: cssVar.spS,
    paddingHorizontal: cssVar.spS,
    paddingTop: 24,
  },
  errorInput: {borderColor: cssVar.cError},
  disabled: {color: cssVar.cWhiteV1},
  disabledInput: {color: cssVar.cWhiteV1},
  focusInput: {borderColor: cssVar.cAccent},
};

const Input = React.memo((props: PropsType) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleTextChange = useCallback((text: string) => {
    if (props.onChange) {
      props.onChange(text);
    }
  }, [props.onChange]);

  const styleInput = useMemo(() => ({
    ...{...theme.default, paddingLeft: props.iconLeft ? 30 : cssVar.spS},
    ...{paddingRight: props.iconRight ? 30 : cssVar.spM},
    ...(isFocused ? theme.focusInput : {}),
    ...(props.error?.[props.name] ? {...theme.errorInput} : {}),
    ...props.style,
    ...(props.disabled ? theme.disabled : {}),
  }), [isFocused, props.error, props.name, props.style, props.disabled, props.iconLeft, props.iconRight]);

  const _onBlur = useCallback((e: any) => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(e);
    }
  }, [props.onBlur]);

  const _onFocus = useCallback((e: any) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  }, [props.onFocus]);

  const textColor = useMemo(() => 
    props.disabled ? theme.disabledInput?.color : theme.default?.color,
    [props.disabled]
  );

  const keyboardType = useMemo(() => {
    if (props.keyboardType) {
      // Para Android, 'number-pad' es más rápido que 'numeric'
      if (props.keyboardType === 'numeric' && Platform.OS === 'android') {
        return 'number-pad';
      }
      return props.keyboardType;
    }
    if (props.type === 'date') {
      return Platform.OS === 'android' ? 'number-pad' : 'numeric';
    }
    if (props.type === 'email-address') {
      return 'email-address';
    }
    return 'default';
  }, [props.keyboardType, props.type]);

  return (
    <ControlLabel {...props} isFocus={isFocused}>
      <TextInput
        testID={props.name}
        id={props.name}
        onFocus={_onFocus}
        onBlur={_onBlur}
        onSubmitEditing={props.onSearch}
        style={{
          color: textColor,
          ...styleInput,
        }}
        keyboardType={keyboardType}
        maxLength={props.maxLength}
        onChangeText={handleTextChange}
        value={props.value}
        returnKeyType={props.search}
        placeholder={isFocused ? '' : props.placeholder || ''}
        placeholderTextColor={cssVar.cWhiteV3}
        editable={!props.disabled && !props.readOnly}
        secureTextEntry={props.password || false}
        autoFocus={props.autoFocus || false}
        autoComplete={props.autoComplete || 'off'}
        autoCapitalize={props.autoCapitalize || 'none'}
        allowFontScaling={false}
      />
    </ControlLabel>
  );
}, (prevProps, nextProps) => {
  // Evita re-renders innecesarios comparando solo las props relevantes
  return (
    prevProps.value === nextProps.value &&
    prevProps.error === nextProps.error &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.maxLength === nextProps.maxLength &&
    prevProps.keyboardType === nextProps.keyboardType &&
    prevProps.password === nextProps.password &&
    prevProps.iconLeft === nextProps.iconLeft &&
    prevProps.iconRight === nextProps.iconRight
  );
});

Input.displayName = 'Input';

export default Input;
