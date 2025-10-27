import {createDrawerNavigator} from '@react-navigation/drawer';
import Navigate from '../Navigate';
import MainMenu from './MainMenu';
import {cssVar} from '../../../mk/styles/themes';
import React from 'react';
import {SafeAreaView as SafeAreaViewAndroid} from 'react-native-safe-area-context';
import {SafeAreaView as SafeAreaViewIos} from 'react-native';

const Drawer = createDrawerNavigator();

const MyDrawer = () => {
  return (
    <SafeAreaViewAndroid style={{flex: 1, backgroundColor: cssVar.cBlack}}>
      <SafeAreaViewIos style={{flex: 1, backgroundColor: cssVar.cBlack}}>
        <Drawer.Navigator
          initialRouteName="navigate"
          screenOptions={({navigation}) => ({
            drawerStyle: {backgroundColor: cssVar.cBlack},
            swipeEnabled: false,
            headerShown: false,
          })}
          drawerContent={props => <MainMenu {...props} />}>
          <Drawer.Screen
            name="navigate"
            component={Navigate}
          />
        </Drawer.Navigator>
      </SafeAreaViewIos>
    </SafeAreaViewAndroid>
  );
};
export default MyDrawer;
