import {createDrawerNavigator} from '@react-navigation/drawer';
import Navigate from '../Navigate';
import MainMenu from './MainMenu';
import {SafeAreaView} from 'react-native';
import {cssVar} from '../../../mk/styles/themes';
import React from 'react';

const Drawer = createDrawerNavigator();

const MyDrawer = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: cssVar.cBlack}}>
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
    </SafeAreaView>
  );
};
export default MyDrawer;
