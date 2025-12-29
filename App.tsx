import { StatusBar, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AxiosProvider from './mk/contexts/AxiosContext';
import axiosInterceptors from './mk/interceptors/axiosInterceptors';
import AuthProvider from './mk/contexts/AuthContext';
import OneSignalContextProvider from './mk/contexts/OneSignalContext';
import InitProject from './src/config/InitProject';
import MyDrawer from './src/navigators/Drawer/Drawer';
import { cssVar } from './mk/styles/themes';
import ActiveNotificationDB from './mk/hooks/ActiveNotificationDB';
import { navigationRef } from './src/navigators/navigationRef';
// import { KeyboardProvider } from 'react-native-keyboard-controller';
import { NetworkProvider } from './mk/contexts/NetworkContext';
import { PerformanceProvider } from './mk/contexts/PerformanceContext';

// Set app start time for performance monitoring
(global as any).__START_TIME__ = Date.now();

function App() {
  (Text as any).defaultProps = (Text as any).defaultProps || {};
  (Text as any).defaultProps.allowFontScaling = false;
  return (
    <SafeAreaProvider>
      {/* <StatusBar backgroundColor={cssVar.cBlack} barStyle={'light-content'} /> */}
      <AppContent />
    </SafeAreaProvider>
  );
}
function AppContent() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: cssVar.cBlack }}>
      <PerformanceProvider>
        <NetworkProvider>
          <AxiosProvider interceptors={axiosInterceptors}>
            {/* <KeyboardProvider> */}
            {/* <StatusBar
              animated={true}
              backgroundColor={cssVar.cBlack}
              barStyle={'light-content'}
            /> */}
            <NavigationContainer ref={navigationRef}>
              <AuthProvider>
                <OneSignalContextProvider>
                  <InitProject />
                  <MyDrawer />
                  <ActiveNotificationDB />
                </OneSignalContextProvider>
              </AuthProvider>
            </NavigationContainer>
            {/* </KeyboardProvider> */}
          </AxiosProvider>
        </NetworkProvider>
      </PerformanceProvider>
    </SafeAreaView>
  );
}

export default App;
