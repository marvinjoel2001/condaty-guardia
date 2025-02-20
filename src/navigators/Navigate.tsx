import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from '../components/auth/Login';
import Home from '../components/Home/Home';

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
      {/* <Stack.Screen
        name="profile"
        component={Profile}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="activity"
        component={Activity}
        options={{
          headerShown: false,
        }}
      /> */}
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          headerShown: false,
        }}
      />

      {/* <Stack.Screen
        name="Events"
        component={Events}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Surveys"
        component={LoadSurveys}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="LoadSurveys"
        component={SurveyList}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="red"
        component={Red}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DetailRegister"
        component={DetailRegister as any}
        options={{
          headerShown: false,
        }}
      /> */}
    </Stack.Navigator>
  );
};
export default Navigate;
