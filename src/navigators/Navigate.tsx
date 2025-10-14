import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

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
        // component={HomeScreen}
        getComponent={() => require('../components/Home/Home').default}
      />
      <Stack.Screen
        name="Profile"
        // component={Profile}
        getComponent={() => require('../components/Profile/Profile').default}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Alerts"
        // component={Alerts}
        getComponent={() => require('../components/Alerts/Alerts').default}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Login"
        // component={Login}
        getComponent={() => require('../components/auth/Login').default}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="Binnacle"
        // component={Binnacle}
        getComponent={() => require('../components/Binnacle/Binnacle').default}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Notifications"
        // component={Notifications}
        getComponent={() =>
          require('../components/Notifications/Notifications').default
        }
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Documents"
        // component={Documents}
        getComponent={() =>
          require('../components/Documents/Documents').default
        }
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="History"
        // component={History}
        getComponent={() => require('../components/History/History').default}
        options={{
          headerShown: false,
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
