import React, {useEffect, useState} from 'react';
import {TextInput, Text, View} from 'react-native';
import ControlLabel, {PropsTypeInputBase} from '../ControlLabel/ControlLabel';
import {cssVar, FONTS, ThemeType} from '../../../styles/themes';

interface PropsType extends PropsTypeInputBase {
  lines?: number;
  maxLength?: number;
  fixedHeight?: boolean;
  multiline?: boolean;
}

export const TextArea = (props: PropsType) => {
  const {value = '', maxLength, multiline = true} = props;
  const [isFocused, setIsFocused] = useState(true);
  const [textLength, setTextLength] = useState(value?.length || 0);

  const styleInput = {
    ...theme.default,
    ...(isFocused && textLength !== maxLength ? theme.focusInput : {}),
    ...(props.error && props.error[props.name] && !props.value
      ? theme.errorInput
      : {}),
    ...props.style,
    ...(props.disabled ? theme.disabledInput : {}),
  };

  const _onBlur = (e: any) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleTextChange = (text: string) => {
    if (maxLength === undefined || text?.length <= maxLength) {
      setTextLength(text?.length);
      props.onChange?.(text);
    }
  };

  useEffect(() => {
    setTextLength(value?.length || 0);
  }, [value]);

  return (
    <ControlLabel
      {...props}
      type="textArea"
      isFocus={isFocused}
      maxLength={maxLength}>
      <View>
        <TextInput
          testID={props.name}
          id={props.name}
          style={styleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={_onBlur}
          returnKeyType="none"
          onChangeText={handleTextChange}
          value={value}
          placeholder={isFocused ? undefined : props.placeholder || ''}
          placeholderTextColor={theme.form?.color}
          editable={!props.disabled && !props.readOnly}
          numberOfLines={props.lines || 8}
          multiline={multiline}
          autoFocus={props.autoFocus}
          allowFontScaling={false}
          maxLength={maxLength ?? undefined} // Permite texto ilimitado si no se define maxLength
        />
        {maxLength !== undefined && (
          <Text style={theme.counter}>
            {textLength}/{maxLength}
          </Text>
        )}
      </View>
    </ControlLabel>
  );
};

const theme: ThemeType = {
  form: {
    color: cssVar.cWhite,
  },
  default: {
    borderWidth: cssVar.bWidth,
    borderColor: cssVar.cBlackV2,
    borderRadius: cssVar.bRadiusS,
    fontSize: cssVar.sM,
    fontFamily: FONTS.regular,
    textAlignVertical: 'top',
    backgroundColor: 'transparent',
    color: cssVar.cWhite,
    paddingVertical: cssVar.spL,
    paddingHorizontal: cssVar.spM,
    height: 120, // Limitar el tamaño del TextInput
  },
  errorInput: {borderColor: cssVar.cError},
  disabledInput: {opacity: 0.6, color: cssVar.cWhiteV3},
  focusInput: {borderColor: cssVar.cWhite},
  counter: {
    fontSize: cssVar.spM,
    color: cssVar.cWhite,
    textAlign: 'right',
    marginTop: 4,
  },
};
