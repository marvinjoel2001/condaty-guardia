import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../components/auth/Login';
import Home from '../components/Home/Home';
import Profile from '../components/Profile/Profile';
import Alerts from '../components/Alerts/Alerts';
import Binnacle from '../components/Binnacle/Binnacle';
import Notifications from '../components/Notifications/Notifications';

const Stack = createNativeStackNavigator();

const Navigate = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{animation: 'none'}}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
        name="Home"
        component={Home}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Alerts"
        component={Alerts}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Binnacle"
        component={Binnacle}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={Notifications}
        options={{
          headerShown: false,
        }}
      />
      {/* <Stack.Screen
        name="LoadSurveys"
        component={SurveyList}
        options={{
          headerShown: false,
        }}
      /> */}
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
