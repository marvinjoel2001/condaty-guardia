import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, RefreshControl, Keyboard, ScrollView, Text} from 'react-native';
import Animated from 'react-native-reanimated';
import HeadTitle from './HeadTitle';
import {cssVar, ThemeType, TypeStyles} from '../../styles/themes';
import {useRoute} from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
import {isAndroid} from '../../utils/utils';
import Footer from '../../../src/navigators/Footer/Footer';
import LockAlert from '../../../src/components/Alerts/LockAlert';
import AlertDetail from '../../../src/components/Alerts/AlertDetail';
import {
  IconAmbulance,
  IconFlame,
  IconTheft,
} from '../../../src/icons/IconLibrary';
import {useEvent} from '../../hooks/useEvent';
import ChooseClient from '../../../src/components/ChooseClient/ChooseClient';
import {useNetwork} from '../../contexts/NetworkContext';

type PropsType = {
  title?: string;
  children?: any;
  style?: TypeStyles;
  head?: boolean;
  foot?: boolean;
  customTitle?: any;
  onPress?: () => void;
  styleHead?: TypeStyles;
  onBack?: () => void;
  refresh?: () => void;
  rigth?: any;
  backUrl?: string;
  avatar?: boolean;
  back?: boolean;
  bounces?: boolean;
  scroll?: boolean;
};

const Layout = (props: PropsType) => {
  const {
    title = '',
    children,
    style,
    customTitle = null,
    onPress = () => {},
    styleHead = {},
    onBack,
    refresh = () => {},
    rigth,
    backUrl,
    back = false,
    avatar = false,
    scroll = true,
    bounces = true,
  } = props;

  const {setStore, store, user} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute();
  const scrollViewRef: any = useRef(null);
  const [openAlert, setOpenAlert]: any = useState({open: false, data: null});
  const [openAlertDetail, setOpenAlertDetail]: any = useState({
    open: false,
    id: null,
  });
  const shouldDisableScroll = route.name === 'QrIndividual';
  const {isInternetReachable, isConnecting, type} = useNetwork();

  // useEffect(() => {
  //   if (isConnecting) return;

  //   if (!isInternetReachable) {
  //     Alert.alert('Sin conexión', 'Verifica tu conexión a internet');
  //   }
  // }, [isInternetReachable, isConnecting]);

  const onNotif = useCallback((data: any) => {
    if (data?.event === 'alerts') {
      console.log('onNotif', data);
      if (data?.payload?.user_id == user?.id) {
        return;
      }
      if (data?.payload?.level == 4) {
        // Para alertas de pánico (nivel 4) usar LockAlert
        setOpenAlert({open: true, data: data?.payload});
      } else {
        // Para otros niveles usar AlertDetail
        setOpenAlertDetail({open: true, id: data?.payload?.id});
      }
    }
  }, []);

  useEvent('onNotif', onNotif);

  const onRefresh = () => {
    setRefreshing(true);
    refresh();
    setRefreshing(false);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({y: 0, animated: true});
    refresh();
    setStore({nContents: 0, contentIds: []});
  };

  useEffect(() => {
    if (store?.scrollTop) {
      scrollToTop();
      setStore({scrollTop: false});
    }
  }, [store?.scrollTop]);

  const isRoute = () => {
    if (
      route.name === 'Home' ||
      route.name === 'Alerts' ||
      route.name === 'History' ||
      route.name === 'Binnacle'
    ) {
      return true;
    }
    return false;
  };
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(isAndroid());
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  const onCloseAlert = () => {
    setOpenAlert({open: false, data: null});
  };

  const onCloseAlertDetail = () => {
    setOpenAlertDetail({open: false, id: null});
  };
  useEffect(() => {
    if (!user?.client_id) {
      setStore({...store, openClient: true});
    }
  }, []);
  return (
    <View style={[theme.layout]} onTouchEnd={onPress}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: 'red',
        }}>
        <Text style={{color: 'white', textAlign: 'center'}}>
          {!isInternetReachable ? 'Sin conexión' : 'Conexión'}
          {type}
        </Text>
      </View>
      <HeadTitle
        title={title}
        customTitle={customTitle}
        back={back}
        style={styleHead}
        right={rigth}
        onBack={onBack}
        backUrl={backUrl}
      />
      <View style={{flex: 1}}>
        {scroll && !shouldDisableScroll ? (
          <ScrollView
            id="LayoutScrollview"
            testID="LayoutScrollview"
            nativeID="LayoutScrollview"
            scrollEventThrottle={16}
            bounces={bounces}
            showsVerticalScrollIndicator={false}
            ref={scrollViewRef}
            keyboardDismissMode="interactive"
            canCancelContentTouches
            disableIntervalMomentum={true}
            style={{
              ...theme.scrollView,
              ...style,
              // paddingTop: isRoute() ? 50 : 0,
            }}
            contentContainerStyle={{
              paddingBottom: isRoute() ? 70 : 0,
              flexGrow: 1,
            }}
            // onScroll={scrollHandler}
            // scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                progressBackgroundColor={cssVar.cBlack}
                colors={[cssVar.cAccent]}
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={cssVar.cAccent}
              />
            }>
            {children}
          </ScrollView>
        ) : (
          // <Animated.View style={animatedViewStyle}>{children}</Animated.View>
          <View
            style={{
              ...theme.scrollView,
              ...style,
              paddingBottom: isRoute() ? 60 : 0,
            }}>
            {children}
          </View>
        )}
      </View>

      {isRoute() && <Footer />}

      {/* LockAlert para alertas de pánico (nivel 4) */}
      {openAlert.open && (
        <LockAlert
          open={openAlert.open}
          onClose={onCloseAlert}
          data={openAlert.data}
        />
      )}

      {/* AlertDetail para otros niveles de alerta */}
      {openAlertDetail.open && (
        <AlertDetail
          open={openAlertDetail.open}
          onClose={onCloseAlertDetail}
          id={openAlertDetail.id}
        />
      )}

      {store?.openClient && (
        <ChooseClient
          open={store?.openClient}
          onClose={() => setStore({...store, openClient: false})}
        />
      )}
    </View>
  );
};

export default Layout;

const theme: ThemeType = {
  layout: {
    backgroundColor: cssVar.cBlack,
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
  },
};
