import React, {useState, useMemo, useCallback} from 'react';
import {TextInput, Dimensions} from 'react-native';
import ControlLabel, {PropsTypeInputBase} from '../ControlLabel/ControlLabel';
import {cssVar, FONTS, ThemeType} from '../../../styles/themes';

interface PropsType extends PropsTypeInputBase {
  lines?: number;
  maxLength?: number;
  maxAutoHeightRatio?: number; // 0..1 (ej. 0.5 = 50% de la pantalla) - Default: 0.4 (40%)
  maxAutoHeight?: number;      // alto máximo en px
}

export const TextArea = (props: PropsType) => {
  const {value, maxLength} = props;
  const [isFocused, setIsFocused] = useState(false);
  
  // Calcular altura mínima basada en líneas y tamaño de fuente
  const fontSize = props.style?.fontSize || theme.default?.fontSize || cssVar.sM;
  const lineHeight = (typeof fontSize === 'number' ? fontSize : 14) * 1.5; // lineHeight es 1.5x el fontSize
  const lines = props.lines || 3; // Default 3 líneas
  const paddingTop = theme.default?.paddingTop || cssVar.spXl;
  const paddingBottom = 8;
  const paddingVertical = (typeof paddingTop === 'number' ? paddingTop : 24) + paddingBottom;
  
  const minHeight = (lines * lineHeight) + paddingVertical;

  const windowHeight = Dimensions.get('window').height;
  const {maxAutoHeightRatio = 0.28} = props; // Default: 40%
  const maxHeight = props.maxAutoHeight || (windowHeight * maxAutoHeightRatio);

  const [height, setHeight] = useState(minHeight);
  const [scrollEnabled, setScrollEnabled] = useState(false);

  const styleInput = useMemo(() => ({
    ...theme.default,
    ...(isFocused ? theme.focusInput : {}),
    ...(props.error?.[props.name] && !props.value ? theme.errorInput : {}),
    ...props.style,
    ...(props.disabled ? theme.disabledInput : {}),
    height: height,
    textAlignVertical: 'top' as const,
  }), [isFocused, props.error, props.name, props.value, props.style, props.disabled, height]);

  const handleTextChange = useCallback((text: string) => {
    if (maxLength === undefined || text?.length <= maxLength) {
      props.onChange?.(text);
    }
  }, [maxLength, props.onChange]);

  const onContentSizeChange = useCallback((e: any) => {
    const contentHeight = e.nativeEvent.contentSize.height;
    
    if (maxHeight) {
      // Con límite máximo
      if (contentHeight <= maxHeight) {
        setHeight(Math.max(minHeight, contentHeight));
        setScrollEnabled(false);
      } else {
        setHeight(maxHeight);
        setScrollEnabled(true);
      }
    } else {
      // Sin límite, crece libremente
      setHeight(Math.max(minHeight, contentHeight));
      setScrollEnabled(false);
    }
  }, [minHeight, maxHeight]);

  return (
    <ControlLabel
      {...props}
      type="textArea"
      isFocus={isFocused}
      maxLength={maxLength}>
      <TextInput
        testID={props.name}
        id={props.name}
        style={styleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          props.onBlur?.({});
        }}
        returnKeyType="none"
        onChangeText={handleTextChange}
        value={value}
        placeholder={props.placeholder || ''}
        placeholderTextColor={cssVar.cWhiteV3}
        editable={!props?.disabled && !props.readOnly}
        multiline={true}
        autoFocus={props.autoFocus}
        allowFontScaling={false}
        maxLength={maxLength ?? undefined}
        onContentSizeChange={onContentSizeChange}
        scrollEnabled={scrollEnabled}
      />
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
