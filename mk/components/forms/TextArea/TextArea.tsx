import React, {useEffect, useState} from 'react';
import {TextInput, Text, View} from 'react-native';
import ControlLabel, {PropsTypeInputBase} from '../ControlLabel/ControlLabel';
import {cssVar, FONTS, ThemeType} from '../../../styles/themes';

interface PropsType extends PropsTypeInputBase {
  lines?: number;
  maxLength?: number;
}

export const TextArea = (props: PropsType) => {
  const {value, maxLength, multiline} = props;
  const [isFocused, setIsFocused] = useState(false);
  const [textLength, setTextLength] = useState(value?.length || 0);
  const lineHeight = 20;
  const lines = props?.lines || 4;

  const styleInput = {
    ...theme.default,
    ...(isFocused ? theme.focusInput : {}),
    ...(props.error && props.error[props.name] && !props.value
      ? theme.errorInput
      : {}),
    ...props.style,
    ...(props.disabled ? theme.disabledInput : {}),
    height: lineHeight * lines,
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
      {/* <View> */}
      <TextInput
        testID={props.name}
        id={props.name}
        style={styleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={_onBlur}
        returnKeyType="none"
        onChangeText={handleTextChange}
        value={value}
        placeholder={props.placeholder || ''}
        placeholderTextColor={cssVar.cWhiteV3}
        editable={!props?.disabled && !props.readOnly}
        numberOfLines={lines}
        multiline={true}
        autoFocus={props.autoFocus}
        allowFontScaling={false}
        textAlignVertical="top"
        maxLength={maxLength ?? undefined} // Permite texto ilimitado si no se define maxLength
      />
      {/* {maxLength !== undefined && (
          <Text style={theme.counter}>
            {textLength}/{maxLength}
          </Text>
        )}
      </View> */}
    </ControlLabel>
  );
};

const theme: ThemeType = {
  form: {
    color: cssVar.cWhiteV1,
  },
  default: {
    borderWidth: cssVar.bWidth,
    borderColor: cssVar.cBlackV2,
    borderRadius: cssVar.bRadiusS,
    fontSize: cssVar.sM,
    fontFamily: FONTS.regular,

    backgroundColor: cssVar.cWhiteV2,
    color: cssVar.cWhite,
    // paddingVertical: cssVar.spL,
    paddingTop: cssVar.spXl,
    paddingHorizontal: cssVar.spS,
  },
  errorInput: {borderColor: cssVar.cError},
  disabledInput: {opacity: 0.6, color: cssVar.cWhiteV3},
  focusInput: {borderColor: cssVar.cAccent},
  counter: {
    fontSize: cssVar.spM,
    color: cssVar.cWhite,
    // textAlign: 'right',
    bottom: -18,
    position: 'absolute',
    marginTop: 4,

    right: 0,
  },
};
