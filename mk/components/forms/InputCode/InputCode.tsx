import React, {useState, useRef, useEffect} from 'react';
import {StyleSheet, Text, View, TextInput, Pressable} from 'react-native';
import {cssVar, FONTS, ThemeType} from '../../../styles/themes';
import {PropsTypeInputBase} from '../ControlLabel/ControlLabel';

const CODE_LENGTH = 4;
interface PropsType extends PropsTypeInputBase {
  onCodeFilled?: (isFilled: boolean) => void;
  readOnly?: boolean;
}

const InputCode = (props: PropsType) => {
  const [containerIsFocused, setContainerIsFocused] = useState(false);
  const [isCodeFull, setIsCodeFull] = useState(false);
  const codeDigitsArray = [1, 2, 3, 4];
  const ref = useRef<TextInput>(null);

  useEffect(() => {
    if (props.value?.length === CODE_LENGTH) {
      setIsCodeFull(true);
      props.onCodeFilled && props.onCodeFilled(true);
    } else {
      setIsCodeFull(false);
      props.onCodeFilled && props.onCodeFilled(false);
    }
  }, [props.value]);

  const handleOnPress = () => {
    setContainerIsFocused(true);
    ref?.current?.focus();
  };

  const handleOnBlur = () => {
    setContainerIsFocused(false);
  };

  const toDigitInput = (_value: number, idx: number) => {
    const emptyInputChar = ' ';
    const code = props.value || '';
    const digit = (code + '').charAt(idx) || emptyInputChar;
    const isCurrentDigit = idx === code.length;
    const isLastDigit = idx === CODE_LENGTH - 1;
    const isCodeFull = code.length === CODE_LENGTH;

    const isFocused = containerIsFocused && isCurrentDigit;
    const styleInput = {
      ...theme.default,
      ...(isFocused ? theme.focus : {}),
      ...(props.error && props.error[props.name]
        ? {marginBottom: 0, ...theme.error}
        : {}),
      ...props.style,
      ...(props.disabled ? theme.disabled : {}),
    };

    return (
      <View key={idx} style={styleInput}>
        <Text
          style={{
            ...style.inputText,
            color: theme.default?.color,
          }}>
          {digit}
        </Text>
      </View>
    );
  };

  return (
    <>
      <Pressable style={style.inputsContainer} onPress={handleOnPress}>
        {codeDigitsArray.map(toDigitInput)}
      </Pressable>
      <TextInput
        testID={props.name}
        id={props.name}
        ref={ref}
        value={props.value}
        onChangeText={props.onChange}
        onBlur={handleOnBlur}
        keyboardType="number-pad"
        returnKeyType="done"
        textContentType="oneTimeCode"
        maxLength={CODE_LENGTH}
        style={style.hiddenCodeInput}
        editable={!props.readOnly}
      />
    </>
  );
};

export default InputCode;

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: cssVar.bWidth,
    borderColor: 'red',
  },
  inputsContainer: {
    paddingHorizontal: cssVar.spS,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: cssVar.spS, // más compacto
    marginBottom: cssVar.spS, // más compacto
    gap: cssVar.spS, // dígitos más juntos
  },
  inputContainer: {
    borderColor: '#cccccc',
    borderWidth: cssVar.bWidth,
    borderRadius: cssVar.bRadius,
    padding: cssVar.spM,
  },
  inputContainerFocused: {
    borderColor: '#0f5181',
  },
  inputText: {
    fontSize: cssVar.sXl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hiddenCodeInput: {
    position: 'absolute',
    height: 0,
    width: 0,
    opacity: 0,
  },
});

const theme: ThemeType = {
  form: {
    color: cssVar.cWhite,
  },
  default: {
    // borderWidth: cssVar.bWidth,
    // borderColor: cssVar.cBlackV3,
    backgroundColor: cssVar.cWhiteV2,
    borderRadius: cssVar.spXs,
    paddingTop: cssVar.spS,
    paddingHorizontal: cssVar.spM,
    marginVertical: cssVar.spS,
    fontSize: cssVar.sM,
    fontFamily: FONTS.regular,
    color: cssVar.cWhite,
    height: 48,
    width: 48,
  },
  error: {borderColor: cssVar.cError, color: cssVar.cError},
  disabled: {opacity: 0.6, color: cssVar.cWhiteV3},
  focus: {
    borderColor: cssVar.cAccent,
  },
};
