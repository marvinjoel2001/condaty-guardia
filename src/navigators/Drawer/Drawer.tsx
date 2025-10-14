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
            // headerLeft: () => <Hamburguer onPress={navigation.toggleDrawer} />,
            drawerStyle: {backgroundColor: cssVar.cBlack},
            // headerTransparent: true,
            swipeEnabled: false,
            // headerStyle: theme.layout?.header,
            // headerBackgroundContainerStyle: theme.layout?.header,
            headerShown: false,
          })}
          drawerContent={props => <MainMenu {...props} />}>
          <Drawer.Screen
            name="navigate"
            // options={
            //   {
            //       headerTitleStyle: {
            //         color: pallete[theme.currentTheme]?.light?.color,
            //       },
            //   }
            // }
            component={Navigate}
          />
        </Drawer.Navigator>
      </SafeAreaViewIos>
    </SafeAreaViewAndroid>
  );
};
export default MyDrawer;
