import React, {useEffect, useState} from 'react';
import {TextInput, Text, View, Dimensions} from 'react-native';
import ControlLabel, {PropsTypeInputBase} from '../ControlLabel/ControlLabel';
import {cssVar, FONTS, ThemeType} from '../../../styles/themes';

interface PropsType extends PropsTypeInputBase {
  lines?: number;
  maxLength?: number;
  maxAutoHeightRatio?: number; // 0..1 (ej. 0.5 = 50% de la pantalla)
  maxAutoHeight?: number;      // alto máximo en px
}

export const TextArea = (props: PropsType) => {
  const {value, maxLength, multiline} = props;
  const [isFocused, setIsFocused] = useState(false);
  // const [textLength, setTextLength] = useState(value?.length || 0);
  const lineHeight = 20;
  const lines = props?.lines || 15;

  // Alto mínimo según líneas (solo texto)
  const minHeightText = lineHeight * lines;

  // Calcula padding vertical efectivo (theme + override de props.style)
  const defaultPaddingTop = (theme.default?.paddingTop as number) ?? 0;
  const defaultPaddingBottom = (theme.default?.paddingBottom as number) ?? 0;
  const stylePaddingTop = (props.style?.paddingTop as number) ?? 0;
  const stylePaddingBottom = (props.style?.paddingBottom as number) ?? 0;
  const verticalPadding =
    defaultPaddingTop + defaultPaddingBottom + stylePaddingTop + stylePaddingBottom;

  // Umbral máximo de crecimiento
  const windowHeight = Dimensions.get('window').height;
  const maxAutoHeight =
    props.maxAutoHeight ??
    (props.maxAutoHeightRatio ? windowHeight * props.maxAutoHeightRatio : undefined);

  // Alto dinámico y control de scroll
  const [inputHeight, setInputHeight] = useState<number>(minHeightText + verticalPadding);
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(false);

  const styleInput = {
    ...theme.default,
    ...(isFocused ? theme.focusInput : {}),
    ...(props.error && props.error[props.name] && !props.value
      ? theme.errorInput
      : {}),
    ...props.style,
    ...(props.disabled ? theme.disabledInput : {}),
    // Altura dinámica con padding incluido
    height: inputHeight,
  };

  const _onBlur = (e: any) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleTextChange = (text: string) => {
    if (maxLength === undefined || text?.length <= maxLength) {
      props.onChange?.(text);
    }
  };

  const onContentSizeChange = (e: any) => {
    const contentHeight = e?.nativeEvent?.contentSize?.height ?? minHeightText;

    // Suma el padding vertical al contenido
    let nextHeight = contentHeight + verticalPadding;

    // Limita por umbral máximo si corresponde
    if (maxAutoHeight !== undefined) {
      nextHeight = Math.min(nextHeight, maxAutoHeight);
    }

    // Respeta un mínimo (texto + padding)
    nextHeight = Math.max(nextHeight, minHeightText + verticalPadding);

    setInputHeight(nextHeight);

    // Habilita scroll solo cuando el contenido (sin padding) supera el umbral
    if (maxAutoHeight !== undefined) {
      setScrollEnabled(contentHeight + verticalPadding > maxAutoHeight);
    } else {
      setScrollEnabled(false);
    }
  };

  // useEffect(() => {
  //   setTextLength(value?.length || 0);
  // }, [value]);

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
        maxLength={maxLength ?? undefined}
        onContentSizeChange={onContentSizeChange}
        scrollEnabled={scrollEnabled}
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
