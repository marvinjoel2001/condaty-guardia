import {Text, View} from 'react-native';
import {cssVar, FONTS, ThemeType} from '../../../../mk/styles/themes';
import buildInfo from '../../../../buildInfo.json';
import configApp from '../../../config/config';

export const VersionBuild = ({}) => {
  return (
    <View style={theme.aboutContainer}>
      <Text style={theme.aboutText}>
        Versión {buildInfo.version} - Build #{buildInfo.buildNumber}-{' '}
        {configApp.API_URL == configApp.API_URL_DEV && 'Desarrollo'}
        {configApp.API_URL == configApp.API_URL_DEMO && 'Demo'}
        {configApp.API_URL == configApp.API_URL_TEST && 'Test'}
        {configApp.API_URL == configApp.API_URL_PRE && 'Pre Prod'}
      </Text>
      <Text style={theme.aboutSubtext}>
        {new Date(buildInfo.buildDate).toLocaleString('es-BO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
};

export default VersionBuild;

const theme: ThemeType = {
  aboutContainer: {
    paddingHorizontal: cssVar.sL,
    paddingVertical: cssVar.sS,
    backgroundColor: cssVar.cBlackV2,
    alignItems: 'center',
  },
  aboutText: {
    color: cssVar.cWhiteV3,
    fontSize: cssVar.sS,
    fontFamily: FONTS.medium,
    marginBottom: 4,
  },
  aboutSubtext: {
    color: cssVar.cWhiteV3,
    fontSize: 10,
    fontFamily: FONTS.regular,
  },
};
