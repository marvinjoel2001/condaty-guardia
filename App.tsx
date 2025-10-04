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

function App() {
  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.allowFontScaling = false;
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AxiosProvider interceptors={axiosInterceptors}>
        <StatusBar
          animated={true}
          backgroundColor={cssVar.cBlack}
          barStyle={'light-content'}
        />
        <NavigationContainer>
          <AuthProvider>
            <ActiveNotificationDB />
            <OneSignalContextProvider>
              <InitProject />
              <MyDrawer />
            </OneSignalContextProvider>
          </AuthProvider>
        </NavigationContainer>
      </AxiosProvider>
    </GestureHandlerRootView>
  );
}

export default App;
