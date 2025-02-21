import {useState} from 'react';
import {Platform, StyleSheetProperties, TextInput} from 'react-native';
import ControlLabel, {PropsTypeInputBase} from '../ControlLabel/ControlLabel';
import {cssVar, FONTS, ThemeType} from '../../../styles/themes';
import React from 'react';
interface PropsType extends PropsTypeInputBase {
  passwordMaxLength?: number;
  ciMaxLength?: number;
  iconLeft?: any;
  iconRight?: any;
}
const Input = (props: PropsType) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleTextChange = (text: string) => {
    if (props.onChange) {
      props.onChange(text);
    }
  };

  const styleInput = {
    ...{...theme.default, paddingLeft: props.iconLeft ? 30 : cssVar.spM},
    ...{paddingRight: props.iconRight ? 30 : cssVar.spM},
    ...(isFocused ? theme.focusInput : {}),
    ...(props.error && props.error[props.name] ? {...theme.errorInput} : {}),
    ...props.style,
    ...(props.disabled ? theme.disabled : {}),
  };

  const _onBlur = (e: any) => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  return (
    <ControlLabel {...props} isFocus={isFocused}>
      <TextInput
        testID={props.name}
        id={props.name}
        onFocus={e => {
          setIsFocused(true), props.onFocus && props.onFocus(e);
        }}
        onBlur={_onBlur}
        onSubmitEditing={props.onSearch}
        style={{
          color: props.disabled
            ? theme.disabledInput?.color
            : theme.default?.color,
          ...styleInput,
        }}
        keyboardType={
          props.keyboardType
            ? props.keyboardType
            : props.type === 'date'
            ? 'numeric'
            : props.type === 'email-address'
            ? 'email-address'
            : 'default'
        }
        maxLength={props.maxLength}
        onChangeText={handleTextChange}
        value={props.value}
        returnKeyType={props.search}
        placeholder={isFocused ? '' : props.placeholder || ''}
        placeholderTextColor={cssVar.cWhiteV1}
        editable={!props.disabled && !props.readOnly}
        secureTextEntry={props.password || false}
        autoFocus={props.autoFocus || false}
        autoComplete={props.autoComplete || 'off'}
        autoCapitalize={props.autoCapitalize || 'none'}
        allowFontScaling={false}
        multiline={props.multiline || false}
      />
    </ControlLabel>
  );
};

export default Input;

const theme: ThemeType = {
  form: {
    color: cssVar.cWhiteV3,
  },
  default: {
    borderWidth: cssVar.bWidth,
    borderColor: cssVar.cBlackV2,
    borderRadius: cssVar.bRadiusS,
    fontSize: cssVar.sM,
    fontFamily: FONTS.regular,
    backgroundColor: cssVar.cBlackV2,
    color: cssVar.cWhite,
    paddingBottom: cssVar.spM,
    paddingHorizontal: cssVar.spM,
    paddingTop: 24,
    // paddingVertical: cssVar.spL,
  },
  errorInput: {borderColor: cssVar.cError},
  disabledInput: {opacity: 0.6, color: cssVar.cWhiteV3},
  focusInput: {borderColor: cssVar.cAccent},
};
