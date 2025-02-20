import {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
export default () => {
  const translationY = useSharedValue(0);
  const scrollDirection = useSharedValue('up');
  const isScrolling = useSharedValue(false);
  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      isScrolling.value = true;
    },
    onEndDrag: (event: any) => {
      const velocity = event.velocity.y;
      isScrolling.value = false;
      if (velocity > 0 && scrollDirection.value === 'down')
        isScrolling.value = true;
    },
    onScroll: event => {
      const offsetY = event.contentOffset.y;
      if (offsetY > translationY.value) {
        scrollDirection.value = 'down';
      } else {
        scrollDirection.value = 'up';
      }
      translationY.value = offsetY;
    },
  });
  const headerStyleIOS = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          scrollDirection.value === 'down' && !isScrolling.value
            ? withTiming(-55, {duration: 300})
            : withTiming(0, {duration: 300}),
      },
    ],
  }));
  const headerStyleAndroid = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          scrollDirection.value === 'down' && !isScrolling.value
            ? withTiming(-55, {duration: 300})
            : withTiming(0, {duration: 300}),
      },
    ],
  }));
  return {
    scrollHandler,
    headerStyleAndroid,
    headerStyleIOS,
  };
};
