import {
  KeyboardAvoidingView,
  View,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import {TypeStyles} from '../../../styles/themes';

interface PropsType {
  children: any;
  style?: TypeStyles;
  behaviorAndroid?: 'position' | 'height';
  hideKeyboard?: boolean;
  keyboardVerticalOffset?: number;
  behaviorIos?: 'position' | 'padding';
}

const Form = ({
  children,
  style = {},
  behaviorAndroid = undefined,
  hideKeyboard = false,
  behaviorIos = 'padding',
  keyboardVerticalOffset,
}: PropsType) => {
  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={
        Platform.OS === 'ios' ? keyboardVerticalOffset : 0
      }
      behavior={Platform.OS === 'ios' ? behaviorIos : behaviorAndroid}
      style={{flex: 1, ...style}}>
      {hideKeyboard ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>{children}</View>
        </TouchableWithoutFeedback>
      ) : (
        <View style={{flex: 1}}>{children}</View>
      )}
    </KeyboardAvoidingView>
  );
};

export default Form;
