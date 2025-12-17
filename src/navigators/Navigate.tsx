import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../components/Home/Home';
import Profile from '../components/Profile/Profile';
import Alerts from '../components/Alerts/Alerts';
import Login from '../components/auth/Login';
import Binnacle from '../components/Binnacle/Binnacle';
import Documents from '../components/Documents/Documents';
import Notifications from '../components/Notifications/Notifications';
import History from '../components/History/History';
import BottomTabs from './BottomTabs/BottomTabs';
import PerformanceDashboard from '../components/PerformanceDashboard/PerformanceDashboard';

const Stack = createNativeStackNavigator();

const Navigate = () => {
  return (
    <Stack.Navigator
      initialRouteName="FooterTab"
      screenOptions={{ animation: 'none' }}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="FooterTab"
        component={BottomTabs}
        // getComponent={() => require('../components/Home/Home').default}
      />

      {/* <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Home"
        component={Home}
        // getComponent={() => require('../components/Home/Home').default}
      /> */}
      <Stack.Screen
        name="Profile"
        component={Profile}
        // getComponent={() => require('../components/Profile/Profile').default}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Alerts"
        component={Alerts}
        // getComponent={() => require('../components/Alerts/Alerts').default}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        // getComponent={() => require('../components/auth/Login').default}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Binnacle"
        component={Binnacle}
        // getComponent={() => require('../components/Binnacle/Binnacle').default}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={Notifications}
        // getComponent={() =>require('../components/Notifications/Notifications').default}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Documents"
        component={Documents}
        // getComponent={() =>require('../components/Documents/Documents').default}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="History"
        component={History}
        // getComponent={() => require('../components/History/History').default}
        options={{
          headerShown: false,
        }}
      />
      {}
      <Stack.Screen
        name="Performance"
        component={PerformanceDashboard}
        // getComponent={() => require('../components/History/History').default}
        options={{
          headerShown: true,
        }}
      />
      {/* <Stack.Screen
        name="red"
        component={Red}
        options={{
          headerShown: false,
        }}
      /> */}
      {/* <Stack.Screen
        name="DetailRegister"
        component={DetailRegister as any}
        options={{
          headerShown: false,
        }}/> */}
    </Stack.Navigator>
  );
};
export default Navigate;
