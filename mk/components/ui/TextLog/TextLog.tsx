import {Text, View} from 'react-native';
import {ThemeType} from '../../../styles/themes';
const TextLog = ({children}: any) => {
  return (
    <View style={theme.pruebas}>
      <Text style={{color: 'white'}}>{children}</Text>
    </View>
  );
};
const theme: ThemeType = {
  pruebas: {
    borderColor: '#00E38C',
    borderWidth: 2,
    backgroundColor: 'black',
  },
};

export default TextLog;
