import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { cssVar, FONTS } from '../../../mk/styles/themes';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {
  IconAlertNotification,
  IconHistorial,
  IconHome,
  IconNovedades,
  IconCalendar,
} from '../../icons/IconLibrary';
import { useNavigationState } from '@react-navigation/native';
import Home from '../../components/Home/Home';
import Alerts from '../../components/Alerts/Alerts';
import History from '../../components/History/History';
import Binnacle from '../../components/Binnacle/Binnacle';
import Reservations from '../../components/Reservations/Reservations';

const Tab = createBottomTabNavigator();

const onTabBarIcon = ({ focused, color, size, route }: any) => {
  let iconName = IconHome;
  let reverse = false;

  if (route.name === 'Home') {
    iconName = IconHome;
  } else if (route.name === 'Alerts') {
    iconName = IconAlertNotification;
    // reverse = true;
  } else if (route.name === 'History') {
    iconName = IconHistorial;
  } else if (route.name === 'Reservations') {
    iconName = IconCalendar;
  } else if (route.name === 'Binnacle') {
    iconName = IconNovedades;
    // reverse = true;
  }

  return (
    <Icon
      name={iconName}
      size={22}
      color={reverse ? 'transparent' : color}
      fillStroke={reverse ? color : 'transparent'}
    />
  );
};

const BottomTabs = () => {
  const state: any = useNavigationState(state => state)?.routes[0]?.state;
  const currentRouteName = state?.routes?.[state.index]?.name;

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            height: 70,
            paddingBottom: 6,
            paddingTop: 6,
            backgroundColor: cssVar.cBlack,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            borderWidth: 0.5,
            borderBottomWidth: 0,
            borderTopColor: cssVar.cWhiteV1,
            borderColor: cssVar.cBlack,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: FONTS.regular,
          },
          tabBarActiveTintColor: cssVar.cAccent,
          tabBarInactiveTintColor: cssVar.cWhiteV1,
          tabBarIcon: ({ focused, color, size }) =>
            onTabBarIcon({ focused, color, size, route }),
        })}
      >
        <Tab.Screen
          name="Home"
          component={Home}
          options={{ tabBarLabel: 'Inicio' }}
        />

        <Tab.Screen
          name="Alerts"
          component={Alerts}
          options={{ tabBarLabel: 'Alertas' }}
        />
        <Tab.Screen
          name="History"
          component={History}
          options={{ tabBarLabel: 'Historial' }}
        />
        <Tab.Screen
          name="Reservations"
          component={Reservations}
          options={{ tabBarLabel: 'Reservas' }}
        />
        <Tab.Screen
          name="Binnacle"
          component={Binnacle}
          options={{ tabBarLabel: 'Bitácora' }}
        />
      </Tab.Navigator>
      {/* {showButton && <ButtonFloatX />} */}
    </>
  );
};

export default BottomTabs;
