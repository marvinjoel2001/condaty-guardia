// Form.tsx
import React, {ReactNode, useCallback, useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface FormProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  pressable?: boolean;
}

const Form = ({children, style, pressable = true}: FormProps) => {
  const dismissKeyboard = useCallback(() => Keyboard.dismiss(), []);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const content = (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={
        Platform.OS === 'ios' ? 60 : isKeyboardVisible ? 44 : 0
      }>
      <ScrollView
        contentContainerStyle={{flex: 1}}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={[{flex: 1, justifyContent: 'space-between'}, style]}>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return pressable ? (
    <Pressable style={{flex: 1}} onPress={dismissKeyboard}>
      {content}
    </Pressable>
  ) : (
    content
  );
};

export default Form;
