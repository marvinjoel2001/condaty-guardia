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
import {
  IconArrowDown,
  IconArrowUp,
  IconGenericQr,
  IconNoQr,
} from '../../../icons/IconLibrary';
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
  const [showButtons, setShowButtons] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    height: translateY.value,
  }));

  const toggleDropdown = () => {
    const newHeight = openDrop ? CLOSED_HEIGHT : OPEN_HEIGHT;
    translateY.value = withSpring(newHeight, {damping: 15, stiffness: 120});
    setOpenDrop(!openDrop);
    if (!openDrop) {
      setTimeout(() => {
        setShowButtons(true);
      }, 300);
    } else {
      setShowButtons(false);
    }
  };

  const handlePanGesture = ({nativeEvent}: any) => {
    if (nativeEvent.translationY < -10) {
      translateY.value = withSpring(OPEN_HEIGHT, {
        damping: 15,
        stiffness: 120,
      });
      setOpenDrop(true);
      setTimeout(() => {
        setShowButtons(true);
      }, 300);
    } else if (nativeEvent.translationY > 10) {
      translateY.value = withSpring(CLOSED_HEIGHT, {
        damping: 15,
        stiffness: 120,
      });
      setOpenDrop(false);
      setShowButtons(false);
    }
  };

  return (
    <PanGestureHandler onGestureEvent={handlePanGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View
          onTouchEnd={toggleDropdown}
          style={{
            borderWidth: 1,
            borderBottomWidth: 0,
            borderBottomColor: cssVar.cBlack,
            borderColor: cssVar.cWhiteV1,
            backgroundColor: cssVar.cBlack,
            width: 94,
            height: 31,
            margin: 'auto',
            borderTopLeftRadius: 38,
            borderTopRightRadius: 38,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: -30,
            left: Dimensions.get('window').width / 2 - 47,
          }}>
          {openDrop ? (
            <Icon
              style={{marginTop: 2}}
              name={IconArrowDown}
              color={cssVar.cWhite}
            />
          ) : (
            <Icon
              style={{marginTop: 2}}
              name={IconArrowUp}
              color={cssVar.cWhite}
            />
          )}
        </View>
        {/* <View onTouchEnd={toggleDropdown} style={styles.containerLine}>
          <View style={styles.line}></View>
        </View> */}
        {showButtons && (
          <>
            <Text style={{...styles.text, marginTop: 20}}>
              Permitir ingreso
            </Text>
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
    bottom: isIos() ? 68.5 : 74,
    borderTopRightRadius: cssVar.bRadius,
    borderTopLeftRadius: cssVar.bRadius,
    // overflow: 'hidden',
    borderWidth: 0.5,
    borderBottomWidth: 0,
    borderTopColor: cssVar.cWhiteV1,
  },
  // containerLine: {
  //   alignItems: 'center',
  //   width: '100%',
  //   justifyContent: 'center',
  //   height: 40,
  // },
  // line: {
  //   backgroundColor: cssVar.cWhiteV1,
  //   height: 6,
  //   width: 54,
  //   borderRadius: cssVar.bRadiusL,
  // },
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
    // overflow: 'hidden',
  },
  buttons: {
    backgroundColor: cssVar.cBlackV1,
    paddingVertical: cssVar.spL,
    paddingHorizontal: cssVar.spXxl,
    // overflow: 'hidden',
    borderRadius: cssVar.bRadius,
  },
});
