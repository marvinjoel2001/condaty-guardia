import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
// import {useEffect} from 'react';
import AxiosProvider from './mk/contexts/AxiosContext';
import axiosInterceptors from './mk/interceptors/axiosInterceptors';
import AuthProvider from './mk/contexts/AuthContext';
import PusherContextProvider from './mk/contexts/PusherContext';
import OneSignalContextProvider from './mk/contexts/OneSignalContext';
import InitProject from './src/config/InitProject';
import MyDrawer from './src/navigators/Drawer/Drawer';
// import SplashScreen from 'react-native-splash-screen';
import {StatusBar, Text} from 'react-native';
import {cssVar} from './mk/styles/themes';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import SplashScreen from 'react-native-splash-screen';
import ActiveNotificationDB from './mk/hooks/ActiveNotificationDB';

function App() {
  // Text.defaultProps = Text.defaultProps || {};
  // Text.defaultProps.allowFontScaling = false;

  // useEffect(() => {
  //   // setTimeout(() => {
  //   SplashScreen.hide();
  //   // }, 2000);
  // }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AxiosProvider interceptors={axiosInterceptors}>
        <StatusBar animated={true} backgroundColor={cssVar.cBlack} />
        <NavigationContainer>
          <AuthProvider>
            <ActiveNotificationDB />
            <OneSignalContextProvider>
              {/* <PusherContextProvider> */}
              <InitProject />
              <MyDrawer />
              {/* </PusherContextProvider> */}
            </OneSignalContextProvider>
          </AuthProvider>
        </NavigationContainer>
      </AxiosProvider>
    </GestureHandlerRootView>
  );
}

export default App;
