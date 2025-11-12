import {NavigationContainer} from '@react-navigation/native';
import AxiosProvider from './mk/contexts/AxiosContext';
import axiosInterceptors from './mk/interceptors/axiosInterceptors';
import AuthProvider from './mk/contexts/AuthContext';
import OneSignalContextProvider from './mk/contexts/OneSignalContext';
import InitProject from './src/config/InitProject';
import MyDrawer from './src/navigators/Drawer/Drawer';
import {StatusBar, Text} from 'react-native';
import {cssVar} from './mk/styles/themes';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import ActiveNotificationDB from './mk/hooks/ActiveNotificationDB';
import {navigationRef} from './src/navigators/navigationRef';
import {KeyboardProvider} from 'react-native-keyboard-controller';
import {NetworkProvider} from './mk/contexts/NetworkContext';

function App() {
  (Text as any).defaultProps = (Text as any).defaultProps || {};
  (Text as any).defaultProps.allowFontScaling = false;
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NetworkProvider>
        <AxiosProvider interceptors={axiosInterceptors}>
          <KeyboardProvider>
            <StatusBar
              animated={true}
              backgroundColor={cssVar.cBlack}
              barStyle={'light-content'}
            />
            <NavigationContainer ref={navigationRef}>
              <AuthProvider>
                <ActiveNotificationDB />
                <OneSignalContextProvider>
                  <InitProject />
                  <MyDrawer />
                </OneSignalContextProvider>
              </AuthProvider>
            </NavigationContainer>
          </KeyboardProvider>
        </AxiosProvider>
      </NetworkProvider>
    </GestureHandlerRootView>
  );
}

export default App;
