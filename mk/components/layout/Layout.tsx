import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, RefreshControl, Keyboard, ScrollView} from 'react-native';
import Animated from 'react-native-reanimated';
import HeadTitle from './HeadTitle';
import {cssVar, ThemeType, TypeStyles} from '../../styles/themes';
import {useRoute} from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
import {isAndroid} from '../../utils/utils';
import Footer from '../../../src/navigators/Footer/Footer';
import LockAlert from '../../../src/components/Alerts/LockAlert';
import {
  IconAmbulance,
  IconFlame,
  IconTheft,
} from '../../../src/icons/IconLibrary';
import {useEvent} from '../../hooks/useEvent';
import ChooseClient from '../../../src/components/ChooseClient/ChooseClient';

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
    bounces = false,
  } = props;

  const {setStore, store, user} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute();
  const scrollViewRef: any = useRef(null);
  const [openAlert, setOpenAlert]: any = useState({open: false, data: null});
  const shouldDisableScroll = route.name === 'QrIndividual';
  const onNotif = useCallback((data: any) => {
    if (data?.event === 'alerts' && data?.payload?.level == 4) {
      setOpenAlert({open: true, data: data?.payload});
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
  useEffect(() => {
    if (!user?.client_id) {
      setStore({...store, openClient: true});
    }
  }, []);
  return (
    <View style={[theme.layout]} onTouchEnd={onPress}>
      <HeadTitle
        title={title}
        customTitle={customTitle}
        back={back}
        avatar={avatar}
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
      {openAlert.open && (
        <LockAlert
          open={openAlert.open}
          onClose={onCloseAlert}
          data={openAlert.data}
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
