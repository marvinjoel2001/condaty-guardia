import React, {ReactNode, useCallback} from 'react';
import {
  View,
  StyleProp,
  ViewStyle,
  Pressable,
  Keyboard,
  Platform,
} from 'react-native';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {isAndroid} from '../../../utils/utils';

interface FormProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  offset?: number;
  pressable?: boolean;
}

const Form = ({children, style, offset = 0, pressable = true}: FormProps) => {
  const dismissKeyboard = useCallback(() => Keyboard.dismiss(), []);

  if (pressable) {
    return (
      <Pressable
        style={{flex: 1}}
        onPress={dismissKeyboard}
        android_disableSound>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={isAndroid() ? offset : 60}
          style={[{flex: 1}, style]}>
          <View style={{flex: 1}}>{children}</View>
        </KeyboardAvoidingView>
      </Pressable>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={isAndroid() ? offset : 60}
      style={[{flex: 1}, style]}>
      <View style={{flex: 1}}>{children}</View>
    </KeyboardAvoidingView>
  );
};

export default Form;
