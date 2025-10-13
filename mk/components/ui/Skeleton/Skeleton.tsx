import React, {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet} from 'react-native';
import {cssVar} from '../../../styles/themes';
export interface PropsTypeSkeleton {
  type: 'access' | 'list' | 'detail';
}
type Props = {
  type: PropsTypeSkeleton['type'];
  style?: any;
};

const Skeleton = ({type = 'list', style}: Props) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5],
    outputRange: [0.3, 0.7],
  });

  const SkeletonItem = () => (
    <Animated.View
      style={[
        styles.skeletonItem,
        {
          opacity,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
        },
      ]}>
      <Animated.View
        style={[
          styles.circle,
          {
            opacity,
            width: 48,
            height: 48,
            marginRight: 16,
            backgroundColor: cssVar.cWhiteV3,
          },
        ]}
      />
      <View style={{flex: 1}}>
        <Animated.View
          style={[
            styles.line,
            {
              opacity,
              height: 20,
              width: '70%',
              backgroundColor: cssVar.cBlackV3,
              marginBottom: 4,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.line,
            {
              opacity,
              height: 16,
              width: '90%',
              backgroundColor: cssVar.cBlackV3,
            },
          ]}
        />
      </View>
    </Animated.View>
  );
  const AccessSkeletonItem = () => (
    <Animated.View
      style={[
        styles.skeletonItem,
        {
          opacity,
          padding: 12,
        },
      ]}>
      <View style={styles.accessHeader}>
        <Animated.View
          style={[
            styles.circle,
            {
              opacity,
              width: 48,
              height: 48,
              marginRight: 16,
              backgroundColor: cssVar.cWhiteV3,
            },
          ]}
        />
        <View style={{flex: 1}}>
          <Animated.View
            style={[
              styles.line,
              {
                opacity,
                height: 12,
                width: '70%',
                backgroundColor: cssVar.cBlackV3,
                marginBottom: 4,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.line,
              {
                opacity,
                height: 10,
                width: '90%',
                backgroundColor: cssVar.cBlackV3,
              },
            ]}
          />
        </View>
      </View>
      <View style={styles.accessTimes}>
        <View style={styles.timeRow}>
          <Animated.View
            style={[
              styles.timeLine,
              {
                opacity,
                backgroundColor: cssVar.cBlackV3,
                width: '40%',
              },
            ]}
          />
        </View>
        <View style={styles.timeRow}>
          <Animated.View
            style={[
              styles.timeLine,
              {
                opacity,
                backgroundColor: cssVar.cBlackV3,
                width: '40%',
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );

  const renderItems = () => {
    switch (type) {
      case 'access':
        return (
          <>
            <AccessSkeletonItem />
            <AccessSkeletonItem />
            <AccessSkeletonItem />
            <AccessSkeletonItem />
            <AccessSkeletonItem />
          </>
        );
      case 'detail':
        return <></>;
      default:
        return (
          <>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </>
        );
    }
  };

  return <View style={[styles.container, style]}>{renderItems()}</View>;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  skeletonItem: {
    backgroundColor: cssVar.cBlackV2,
    borderRadius: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 2,
    alignItems: 'center',
  },
  circle: {
    borderRadius: 24,
  },
  line: {
    borderRadius: 6,
  },
  accessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  accessTimes: {
    marginLeft: 0,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeLine: {
    height: 10,
    borderRadius: 4,
  },
});

export default Skeleton;
