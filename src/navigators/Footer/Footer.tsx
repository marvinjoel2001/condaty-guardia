import React from 'react';
import {Animated, ImageBackground, View} from 'react-native';
import ItemFoot from './ItemFoot';
import {
  IconAlert,
  IconContactos,
  IconFeedBack,
  IconHistorial,
  // IconActivities,
  // IconEvent,
  IconHome,
  IconKey,
  IconPending,
  // IconRed,
  // IconSurveys,
  IconUser,
} from '../../icons/IconLibrary';
import {cssVar, ThemeType} from '../../../mk/styles/themes';
import useAuth from '../../../mk/hooks/useAuth';
import {usePusher} from '../../../mk/contexts/PusherContext';

const Footer = ({styles}: any) => {
  const {store} = useAuth();
  // const {pusher, socketNew, socketEvent} = usePusher();
  const Render = ({children}: any) => {
    return (
      // <ImageBackground
      //   source={require('../../images/ImageFooter.png')}
      //   resizeMode="contain"
      //   style={{
      //     ...theme.container,
      //     ...styles,
      //   }}>
      <View
        style={{
          ...theme.container,
          ...styles,
        }}>
        {children}
      </View>
      // </ImageBackground>
    );
  };

  return (
    <Render>
      <ItemFoot
        path="Home"
        text="Inicio"
        icon={IconHome}
        isActived={(store?.nContents || 0) > 0}
      />

      <ItemFoot
        path="Alerts"
        text="Alertas"
        icon={IconAlert}
        isActived={(store?.nEvents || 0) > 0}
      />
      <ItemFoot
        path="History"
        text="Actividad"
        icon={IconHistorial}
        isActived={(store?.nSurveys || 0) > 0}
      />

      <ItemFoot path="feedback" text="Feedback" icon={IconFeedBack} />
      {/* <ItemFoot
        path="activity"
        text="Actividades"
        icon={IconActivities}
        isActived={(store?.nActivity || 0) > 0}
      /> */}
    </Render>
  );
};
const theme: ThemeType = {
  container: {
    flexDirection: 'row',
    paddingVertical: cssVar.spM,
    backgroundColor: cssVar.cBlack,
    position: 'absolute',
    // borderTopLeftRadius: 12,
    // borderTopRightRadius: 12,
    borderTopColor: cssVar.cBlackV2,
    borderTopWidth: 2,
    width: '100%',
    bottom: 0,
  },
};

export default Footer;
