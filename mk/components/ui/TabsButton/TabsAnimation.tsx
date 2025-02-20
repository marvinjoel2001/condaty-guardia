import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import {cssVar, FONTS} from '../../../styles/themes';

interface Tab {
  value: string;
  text: string;
  notificationCount?: number;
}

interface TabsAnimationProps {
  sel: string;
  tabs: Tab[];
  setSel: (value: string) => void;
  style?: any;
  styleContainer?: any;
  styleButton?: any;
  styleText?: any;
}

const TabsAnimation = ({
  sel,
  tabs,
  setSel,
  style = {},
  styleContainer = {},
  styleButton = {},
  styleText = {},
}: TabsAnimationProps) => {
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const {width} = Dimensions.get('window');
  const tabWidth = width / tabs.length - 14;

  useEffect(() => {
    const index = tabs.findIndex(tab => tab.value === sel);
    animationProgress.setValue(0);
    Animated.parallel([
      Animated.timing(indicatorAnim, {
        toValue: index * tabWidth,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animationProgress, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [sel]);

  const animationProgress = useRef(new Animated.Value(0)).current;

  return (
    <View style={[styles.container, styleContainer]}>
      <View style={styles.tabsContainer}>
        <Animated.View
          style={[
            styles.indicator,
            {
              width: tabWidth,
              transform: [{translateX: indicatorAnim}],
            },
          ]}
        />
        {tabs.map((tab, index) => {
          const isSelected = sel === tab.value;

          const whiteOpacity = animationProgress.interpolate({
            inputRange: [0, 1],
            outputRange: isSelected ? [0, 1] : [1, 0],
          });
          const grayOpacity = animationProgress.interpolate({
            inputRange: [0, 1],
            outputRange: isSelected ? [1, 0] : [0, 1],
          });

          return (
            <TouchableOpacity
              key={tab.value}
              onPress={() => setSel(tab.value)}
              style={[styles.button, styleButton, {width: tabWidth}]}>
              <Animated.Text
                style={[
                  styles.text,
                  styleText,
                  {
                    color: cssVar.cBlack,
                    position: 'absolute',
                    opacity: whiteOpacity,
                  },
                ]}>
                {tab.text}
              </Animated.Text>
              <Animated.Text
                style={[
                  styles.text,
                  styleText,
                  {
                    color: cssVar.cBlackV2,
                    opacity: grayOpacity,
                  },
                ]}>
                {tab.text}
              </Animated.Text>
              {tab.notificationCount && tab.notificationCount > 0 && (
                <View style={styles.notificationDot}>
                  <Text style={styles.notificationText}>
                    {tab.notificationCount > 9 ? '+9' : tab.notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default TabsAnimation;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  tabsContainer: {
    flexDirection: 'row',
    position: 'relative',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: cssVar.spS,
  },
  text: {
    fontSize: cssVar.sM,
    fontFamily: FONTS.medium,
    color: cssVar.cBlackV2,
  },
  selectedText: {
    color: cssVar.cWhite,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: cssVar.cWhite,
    borderRadius: cssVar.bRadiusS,
  },
  notificationDot: {
    position: 'absolute',
    top: -5,
    right: 10,
    backgroundColor: '#f11',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: cssVar.cWhite,
    fontSize: cssVar.sS,
    fontFamily: FONTS.semiBold,
  },
});
