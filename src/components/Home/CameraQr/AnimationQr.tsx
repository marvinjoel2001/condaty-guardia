import React, {useEffect, useState} from 'react';
import {Animated, Easing, View} from 'react-native';
import {cssVar} from '../../../../mk/styles/themes';

const AnimationQr = () => {
  const [translateY] = useState(new Animated.Value(0));
  useEffect(() => {
    let isMounted = true;

    const startAnimation = () => {
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 300,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isMounted) {
          startAnimation();
        }
      });
    };

    startAnimation();

    return () => {
      isMounted = false;
      // Detener la animación cuando el componente se desmonta o ya no es visible
      translateY.stopAnimation();
    };
  }, [translateY]);
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <View
        style={{
          width: '80%',
          height: 300,
          overflow: 'visible',
          alignItems: 'center',
        }}>
        <Animated.View
          style={{
            transform: [{translateY}],
            width: '94%',
            shadowColor: cssVar.cAccent,
            shadowOffset: {
              width: 0,
              height: 10,
            },
            shadowOpacity: 1,
            shadowRadius: 10,
            elevation: 9,
            height: 0.5,
            backgroundColor: cssVar.cAccent,
          }}></Animated.View>
        <View
          style={{
            width: '30%',
            height: '30%',
            borderColor: cssVar.cAccent,
            borderStyle: 'solid',
            borderTopWidth: 2,
            borderLeftWidth: 2,
            backgroundColor: 'transparent',
            position: 'absolute',
            top: 0,
            left: 0,
            borderTopLeftRadius: 12,
          }}></View>
        <View
          style={{
            width: '30%',
            height: '30%',
            borderColor: cssVar.cAccent,
            borderStyle: 'solid',
            borderTopWidth: 2,
            borderRightWidth: 2,
            backgroundColor: 'transparent',
            position: 'absolute',
            top: 0,
            right: 0,
            borderTopRightRadius: 12,
          }}></View>
        <View
          style={{
            width: '30%',
            height: '30%',
            borderColor: cssVar.cAccent,
            borderStyle: 'solid',
            borderBottomWidth: 2,
            borderLeftWidth: 2,
            backgroundColor: 'transparent',
            position: 'absolute',
            bottom: 0,
            left: 0,
            borderBottomLeftRadius: 12,
          }}></View>
        <View
          style={{
            width: '30%',
            height: '30%',
            borderColor: cssVar.cAccent,
            borderStyle: 'solid',
            borderBottomWidth: 2,
            borderRightWidth: 2,
            backgroundColor: 'transparent',
            position: 'absolute',
            bottom: 0,
            right: 0,
            borderBottomRightRadius: 12,
          }}></View>
      </View>
    </View>
  );
};

export default AnimationQr;
