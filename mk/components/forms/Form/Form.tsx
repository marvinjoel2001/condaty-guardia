import React, {ReactNode} from 'react';
import {View, StyleProp, ViewStyle} from 'react-native';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {isAndroid} from '../../../utils/utils';
interface FormProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

const Form: React.FC<FormProps> = ({children, style}) => {
  const content = <View style={{flex: 1}}>{children}</View>;

  return (
    <KeyboardAvoidingView
      behavior={'padding'}
      keyboardVerticalOffset={isAndroid() ? 30 : 0}
      style={[{flex: 1}, style]}>
      {content}
    </KeyboardAvoidingView>
  );
};

export default Form;
