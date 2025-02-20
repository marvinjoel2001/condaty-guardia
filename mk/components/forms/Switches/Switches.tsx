import React, {useState} from 'react';
import ControlLabel, {PropsTypeInputBase} from '../ControlLabel/ControlLabel';
import {Switch, Text} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {cssVar, FONTS, ThemeType} from '../../../styles/themes';

interface InputProps extends PropsTypeInputBase {
  optionValue: string[];
  optionLabel?: string[];
}

const Switches = (props: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const styleInput = {
    ...theme.default,
    ...(isFocused ? theme.focusInputs : {}),
    ...(props.error && props.error[props.name]
      ? {marginBottom: 0, ...theme.errorInput}
      : {}),
    ...props.style,
    ...(props.disabled ? theme.disabledInput : {}),
  };

  const toggleSwitch = (e: any) => {
    let sel = props.optionValue ? props.optionValue[1] : 'N';
    if (e) {
      sel = props.optionValue ? props.optionValue[0] : 'Y';
    }
    if (props.onChange) {
      props.onChange(sel);
    }
  };

  return (
    <ControlLabel {...props}>
      <TouchableOpacity
        style={{flexDirection: 'row'}}
        onPress={() =>
          toggleSwitch(!(props.value === (props.optionValue[0] || 'Y')))
        }
        disabled={props.disabled}
        activeOpacity={1}>
        <Text
          style={{
            ...styleInput,
            backgroundColor: undefined,
            borderColor: undefined,
            borderWidth: 0,
          }}>
          {props.label}
        </Text>
        <Switch
          testID={props.name}
          id={props.name}
          trackColor={{
            false: cssVar.cWhiteV3,
            true: cssVar.cAccent,
          }}
          thumbColor={
            props.value === (props.optionValue[0] || 'Y')
              ? cssVar.cAccent
              : cssVar.cWhiteV3
          }
          ios_backgroundColor={cssVar.cWhiteV3}
          onValueChange={toggleSwitch}
          value={props.value === (props.optionValue[0] || 'Y')}
          disabled={props.disabled}
        />
      </TouchableOpacity>
    </ControlLabel>
  );
};

export default Switches;

const theme: ThemeType = {
  form: {
    color: cssVar.cWhiteV3,
  },
  default: {
    borderWidth: cssVar.sXs,
    borderColor: cssVar.cBlackV2,
    borderRadius: cssVar.bRadius,
    paddingTop: cssVar.spS,
    paddingHorizontal: cssVar.spM,
    marginVertical: cssVar.spS,
    fontSize: cssVar.sM,
    fontFamily: FONTS.regular,
    backgroundColor: cssVar.cBlackV2,
    color: cssVar.cWhiteV1,
    height: 64,
  },
  errorInput: {borderColor: cssVar.cError, color: cssVar.cError},
  disabledInput: {opacity: 0.6, color: cssVar.cWhiteV3},
  focusInput: {borderColor: cssVar.cAccent},
};
