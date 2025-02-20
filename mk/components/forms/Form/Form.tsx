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
  behaviorAndroid?: boolean;
  hideKeyboard?: boolean;
}

const Form = ({
  children,
  style = {},
  behaviorAndroid,
  hideKeyboard = false,
}: PropsType) => {
  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : behaviorAndroid
          ? 'height'
          : undefined
      }
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
