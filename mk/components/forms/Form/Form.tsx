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
  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={keyboardVerticalOffset}
      behavior={Platform.OS === 'ios' ? behaviorIos : behaviorAndroid}
      style={{flex: 1, ...style}}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          ...contentContainerStyle,
        }}>
        {hideKeyboard ? (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{flex: 1}}>{children}</View>
          </TouchableWithoutFeedback>
        ) : (
          <View style={{flex: 1}}>{children}</View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Form;
