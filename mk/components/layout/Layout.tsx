import React, {useEffect, useRef, useState} from 'react';
import {View, RefreshControl, Text} from 'react-native';
import Animated from 'react-native-reanimated';
import HeadTitle from './HeadTitle';
import {cssVar, ThemeType, TypeStyles} from '../../styles/themes';
import {useRoute} from '@react-navigation/native';
import useAuth from '../../hooks/useAuth';
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
  const [refreshing, setRefreshing] = useState(false);
  const route = useRoute();
  const scrollViewRef: any = useRef(null);

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
    if (route.name === 'Home' || route.name === 'Alerts') {
      return true;
    }
    return false;
  };

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
            contentContainerStyle={{paddingBottom: isRoute() ? 70 : 0}}
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
            style={{
              paddingBottom: isRoute() ? 60 : 0,
            }}>
            {children}
          </View>
        )}
      </View>

      {isRoute() && <Footer />}
      {/* <Footer /> */}

      {/* {configApp.API_URL != configApp.API_URL_PROD && <PerformanceMonitor />} */}
    </View>
  );
};

export default Layout;

const theme: ThemeType = {
  layout: {
    backgroundColor: cssVar.cBlackV1,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
};
