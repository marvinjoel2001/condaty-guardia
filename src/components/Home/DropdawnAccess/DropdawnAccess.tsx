import React, {useState} from 'react';
import {Text, View, Dimensions, StyleSheet} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {cssVar, FONTS} from '../../../../mk/styles/themes';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {IconGenericQr, IconNoQr} from '../../../icons/IconLibrary';
import {isIos} from '../../../../mk/utils/utils';

const CLOSED_HEIGHT = 40;
const OPEN_HEIGHT = 234;

type PropsType = {
  onPressQr: () => void;
  onPressCiNom: () => void;
};

const DropdawnAccess = ({onPressQr, onPressCiNom}: PropsType) => {
  const [openDrop, setOpenDrop] = useState(false);
  const translateY = useSharedValue(CLOSED_HEIGHT);

  const animatedStyle = useAnimatedStyle(() => ({
    height: translateY.value,
  }));

  const toggleDropdown = () => {
    const newHeight = openDrop ? CLOSED_HEIGHT : OPEN_HEIGHT;
    translateY.value = withSpring(newHeight, {damping: 15, stiffness: 120});
    setOpenDrop(!openDrop);
  };

  const handlePanGesture = ({nativeEvent}: any) => {
    if (nativeEvent.translationY < -10) {
      translateY.value = withSpring(OPEN_HEIGHT, {
        damping: 15,
        stiffness: 120,
      });
      setOpenDrop(true);
    } else if (nativeEvent.translationY > 10) {
      translateY.value = withSpring(CLOSED_HEIGHT, {
        damping: 15,
        stiffness: 120,
      });
      setOpenDrop(false);
    }
  };

  return (
    <PanGestureHandler onGestureEvent={handlePanGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View onTouchEnd={toggleDropdown} style={styles.containerLine}>
          <View style={styles.line}></View>
        </View>
        {openDrop && (
          <>
            <Text style={styles.text}>Permitir ingreso</Text>
            <View
              onTouchEnd={e => {
                e.stopPropagation();
              }}
              style={styles.containerButtons}>
              <View onTouchEnd={onPressCiNom} style={styles.buttons}>
                <Icon
                  size={50}
                  name={IconNoQr}
                  color={'transparent'}
                  fillStroke={cssVar.cWhite}
                />
                <Text style={{color: cssVar.cWhite}}>Sin QR</Text>
              </View>
              <View onTouchEnd={onPressQr} style={styles.buttons}>
                <Icon size={50} name={IconGenericQr} color={cssVar.cWhite} />
                <Text style={{color: cssVar.cWhite}}>Leer QR</Text>
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </PanGestureHandler>
  );
};

export default DropdawnAccess;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    backgroundColor: cssVar.cBlack,
    bottom: isIos() ? 70 : 74,
    borderTopRightRadius: cssVar.bRadiusL,
    borderTopLeftRadius: cssVar.bRadiusL,
    overflow: 'hidden',
  },
  containerLine: {
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    height: 40,
  },
  line: {
    backgroundColor: cssVar.cWhiteV2,
    height: 6,
    width: 54,
    borderRadius: cssVar.bRadiusL,
  },
  text: {
    color: cssVar.cWhite,
    textAlign: 'center',
    fontFamily: FONTS.semiBold,
    fontSize: cssVar.sXxl,
    marginBottom: cssVar.spL,
  },
  containerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttons: {
    backgroundColor: cssVar.cBlackV1,
    paddingVertical: cssVar.spL,
    paddingHorizontal: cssVar.spXxl,
    borderRadius: cssVar.bRadius,
  },
});
