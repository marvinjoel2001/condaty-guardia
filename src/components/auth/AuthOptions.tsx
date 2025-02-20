import {Text, View} from 'react-native';
import {cssVar, FONTS, ThemeType} from '../../../mk/styles/themes';

const AuthOptions = () => {
  return (
    <View style={theme.container}>
      <View style={theme.line} />
      <Text style={theme.text}>O también ingresa con</Text>
      <View style={{flexDirection: 'row', gap: cssVar.spS}}>
        <View style={theme.option}>
          <Text style={{color: cssVar.cBlack}}>Facebook</Text>
        </View>
        <View style={theme.option}>
          <Text style={{color: cssVar.cBlack}}>Email</Text>
        </View>
        <View style={theme.option}>
          <Text style={{color: cssVar.cBlack}}>Google</Text>
        </View>
      </View>
    </View>
  );
};
const theme: ThemeType = {
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    height: 1,
    backgroundColor: cssVar.cWhiteV1,
    position: 'absolute',
    width: '100%',
    top: 17,
  },
  text: {
    color: cssVar.cBlackV2,
    backgroundColor: cssVar.cWhite,
    paddingVertical: cssVar.spS,
    paddingHorizontal: cssVar.spXs,
  },
  option: {
    flexGrow: 1,
    borderWidth: 0.5,
    borderColor: cssVar.cBlackV2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: cssVar.spXxl,
    paddingVertical: cssVar.spL,
    borderRadius: cssVar.bRadiusS,
  },
};

export default AuthOptions;
