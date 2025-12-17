import { NewAppScreen } from '@react-native/new-app-screen';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Text,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { NavigationContainer } from '@react-navigation/native';
import AxiosProvider from './mk/contexts/AxiosContext';
import axiosInterceptors from './mk/interceptors/axiosInterceptors';
import AuthProvider from './mk/contexts/AuthContext';
import OneSignalContextProvider from './mk/contexts/OneSignalContext';
import InitProject from './src/config/InitProject';
import MyDrawer from './src/navigators/Drawer/Drawer';
import { cssVar } from './mk/styles/themes';
// import {GestureHandlerRootView} from 'react-native-gesture-handler';
import ActiveNotificationDB from './mk/hooks/ActiveNotificationDB';
import { navigationRef } from './src/navigators/navigationRef';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { NetworkProvider } from './mk/contexts/NetworkContext';
import { PerformanceProvider } from './mk/contexts/PerformanceContext';

function App() {
  (Text as any).defaultProps = (Text as any).defaultProps || {};
  (Text as any).defaultProps.allowFontScaling = false;
  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={cssVar.cBlack} barStyle={'light-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}
function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      /> */}
      {/* <GestureHandlerRootView style={{flex: 1}}> */}
      <PerformanceProvider>
        <NetworkProvider>
          <AxiosProvider interceptors={axiosInterceptors}>
            <KeyboardProvider>
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
            </KeyboardProvider>
          </AxiosProvider>
        </NetworkProvider>
      </PerformanceProvider>
      {/* </GestureHandlerRootView> */}
    </SafeAreaView>
  );
}

export default App;
