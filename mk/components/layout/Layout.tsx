import React, {useEffect, useRef, useState} from 'react';
import {View, RefreshControl, Text} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  PerformanceMonitor,
  Easing,
} from 'react-native-reanimated';
import HeadTitle from './HeadTitle';
import {cssVar, ThemeType, TypeStyles} from '../../styles/themes';

import {useRoute} from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
import ToastNotif from './ToastNotif';
// import ModalCongratulationMedal from '../../../src/components/Medal/ModalCongratulationMedal';
import Modal from '../ui/Modal/Modal';
// import AccountRegister from '../../../src/components/Register/AccountRegister';
import configApp from '../../../src/config/config';
import {logPerformance} from '../../utils/utils';
import Footer from '../../../src/navigators/Footer/Footer';

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
  } = props;

  const {setStore, store, user} = useAuth();
  const [openMedal, setOpenMedal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute();
  const scrollViewRef: any = useRef(null);
  const headerHeight: any = useSharedValue(50);
  const toastPosition: any = useSharedValue(60);
  const [completeRegister, setCompleteRegister] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    refresh();
    setRefreshing(false);
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({y: 0, animated: true});
    // if (store?.onFlatRef) store?.onFlatRef.current?.scrollToOffset({offset: 0});
    refresh();
    setStore({nContents: 0, contentIds: []});
  };

  useEffect(() => {
    if (store?.scrollTop) {
      scrollToTop();
      setStore({scrollTop: false});
    }
  }, [store?.scrollTop]);

  // const headerHide = (event: any) => {
  //   const currentOffset = event.contentOffset.y;
  //   if (Math.abs(currentOffset - previousOffset.value) < 10) {
  //     return;
  //   }

  //   if (currentOffset <= 10 || currentOffset < previousOffset.value) {
  //     // Mostrar header
  //     headerHeight.value = withTiming(50, {
  //       duration: 300,
  //       easing: Easing.out(Easing.cubic),
  //     });
  //     toastPosition.value = withTiming(50, {
  //       duration: 300,
  //       easing: Easing.out(Easing.cubic),
  //     });
  //   } else {
  //     // Ocultar header
  //     headerHeight.value = withTiming(0, {
  //       duration: 300,
  //       easing: Easing.inOut(Easing.cubic),
  //     });
  //     toastPosition.value = withTiming(0, {
  //       duration: 300,
  //       easing: Easing.inOut(Easing.cubic),
  //     });
  //   }

  //   previousOffset.value = currentOffset;
  // };
  // const [onScrollOld, setOnScrollOld] = useState(0);
  // useEffect(() => {
  //   if (store?.onScroll != onScrollOld) {
  //     setOnScrollOld(store?.onScroll);
  //     headerHide({contentOffset: {y: store?.onScroll || 0}});
  //   }
  // }, [store?.onScroll]);

  const previousOffset = useSharedValue(0);
  // const scrollHandler = useAnimatedScrollHandler({
  //   onScroll: event => {
  //     const currentOffset = event.contentOffset.y;
  //     if (currentOffset <= 100 || currentOffset < previousOffset.value) {
  //       headerHeight.value = withTiming(50, {
  //         duration: 40,
  //       });
  //       toastPosition.value = withTiming(50, {duration: 300});
  //     } else {
  //       headerHeight.value = withTiming(0, {duration: 300});
  //       toastPosition.value = withTiming(0, {duration: 300});
  //     }
  //     previousOffset.value = currentOffset;
  //   },
  // });

  const isRoute = () => {
    if (route.name == 'Home') {
      return true;
    }
    return false;
  };

  // const animatedToastStyle = useAnimatedStyle(() => {
  //   return {
  //     position: 'absolute',
  //     top: toastPosition.value,
  //     width: '100%',
  //     zIndex: 101,
  //   };
  // });

  // const animatedHeaderStyle = useAnimatedStyle(() => {
  //   return {
  //     height: headerHeight.value,
  //     overflow: 'hidden',
  //     position: 'absolute',
  //     top: 0,
  //     zIndex: 100,
  //     backgroundColor: cssVar.cBlack,
  //     width: '100%',
  //   };
  // });

  // const animatedViewStyle = useAnimatedStyle(() => {
  //   return {
  //     paddingTop: headerHeight.value,
  //     flex: 1,
  //     // paddingTop: isRoute() ? 50 : 0,
  //     paddingBottom: 80,
  //   };
  // });
  // const setSearch = (v: string) => {
  //   setStore({searchNO: v});
  // };
  useEffect(() => {
    if (store?.nMedals) {
      setOpenMedal(true);
    }
  }, [store?.nMedals]);

  // useEffect(() => {
  //   if (store?.onRefresh && store?.onRefresh > 0) {
  //     onRefresh();
  //   }
  // }, [store?.onRefresh]);

  return (
    <View style={[theme.layout]} onTouchEnd={onPress}>
      {/* <Animated.View style={isRoute() ? {...animatedHeaderStyle} : {}}> */}
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
      {/* </Animated.View> */}

      <View style={{flex: 1}}>
        {scroll ? (
          <Animated.ScrollView
            id="LayoutScrollview"
            testID="LayoutScrollview"
            nativeID="LayoutScrollview"
            // onScroll={({nativeEvent}: any) => {
            //   headerHide(nativeEvent);
            // }}
            scrollEventThrottle={16}
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
            // contentContainerStyle={{paddingBottom: isRoute() ? 100 : 0}}
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
          </Animated.ScrollView>
        ) : (
          // <Animated.View style={animatedViewStyle}>{children}</Animated.View>
          <View
          // style={{
          //   paddingBottom: 60,
          //   // paddingTop: isRoute() ? 50 : 0,
          // }}
          >
            {children}
          </View>
        )}
      </View>
      {/* {route.name == 'home' && store?.nContents > 0 && (
        <Animated.View style={animatedToastStyle}>
          <ToastNotif
            list={store?.contentIds}
            onTop={() => scrollToTop()}
            count={store?.nContents}
          />
        </Animated.View>
      )} */}

      {route.name === 'Home' && <Footer />}
      {/* <Footer /> */}

      {/* {configApp.API_URL != configApp.API_URL_PROD && <PerformanceMonitor />} */}
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
  },
};
