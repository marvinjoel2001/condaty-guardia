import {
  KeyboardAvoidingView,
  View,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {TypeStyles} from '../../../styles/themes';

interface PropsType {
  children: any;
  style?: TypeStyles;
  behaviorAndroid?: 'position' | 'height';
  hideKeyboard?: boolean;
  keyboardVerticalOffset?: number;
  behaviorIos?: 'position' | 'padding';
  contentContainerStyle?: TypeStyles;
}
const Form = ({
  children,
  style = {},
  behaviorAndroid = undefined,
  hideKeyboard = false,
  behaviorIos = 'padding',
  keyboardVerticalOffset = 0,
  contentContainerStyle = {},
}: PropsType) => {
  const Wrapper: any = hideKeyboard ? TouchableWithoutFeedback : View;

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={keyboardVerticalOffset}
      behavior={Platform.OS === 'ios' ? behaviorIos : behaviorAndroid}
      style={[{flex: 1}, style]}>
      <Wrapper
        {...(hideKeyboard && {onPress: Keyboard.dismiss})}
        style={{flex: 1}}>
        <SafeAreaView style={{flex: 1}}>{children}</SafeAreaView>
      </Wrapper>
    </KeyboardAvoidingView>
  );
};

export default Form;
