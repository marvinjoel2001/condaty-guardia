import React, {useState, useCallback, useRef, useEffect} from 'react';
import {Text, View, Dimensions, StyleSheet} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
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
const OPEN_HEIGHT = 204;
const SPRING_CONFIG = {damping: 15, stiffness: 120};
const SHOW_DELAY = 250;

type PropsType = {
  onPressQr: () => void;
  onPressCiNom: () => void;
};

const DropdawnAccess = ({onPressQr, onPressCiNom}: PropsType) => {
  const [openDrop, setOpenDrop] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const translateY = useSharedValue(CLOSED_HEIGHT);

  const delayTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (delayTimeout.current) clearTimeout(delayTimeout.current);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    height: translateY.value,
  }));

  const open = useCallback(() => {
    translateY.value = withSpring(OPEN_HEIGHT, SPRING_CONFIG);
    runOnJS(setOpenDrop)(true);

    // Esperar a que se abra completamente antes de mostrar los botones
    delayTimeout.current = setTimeout(() => {
      runOnJS(setShowButtons)(true);
    }, SHOW_DELAY);
  }, [translateY]);

  const close = useCallback(() => {
    if (delayTimeout.current) clearTimeout(delayTimeout.current);
    translateY.value = withSpring(CLOSED_HEIGHT, SPRING_CONFIG);
    runOnJS(setOpenDrop)(false);
    runOnJS(setShowButtons)(false);
  }, [translateY]);

  const toggleDropdown = useCallback(() => {
    if (openDrop) close();
    else open();
  }, [openDrop, open, close]);

  const handlePanGesture = useCallback(
    ({nativeEvent}: any) => {
      if (nativeEvent.translationY < -10 && !openDrop) {
        open();
      } else if (nativeEvent.translationY > 10 && openDrop) {
        close();
      }
    },
    [openDrop, open, close],
  );

  return (
    <PanGestureHandler onGestureEvent={handlePanGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View
          onTouchEnd={toggleDropdown}
          style={{
            borderWidth: 0.5,
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
          <Icon
            style={{marginTop: 2}}
            name={openDrop ? IconArrowDown : IconArrowUp}
            color={cssVar.cWhite}
          />
        </View>

        {showButtons && (
          <>
            <Text style={{...styles.text, marginTop: 20}}>
              Permitir ingreso
            </Text>
            <View
              onTouchEnd={e => e.stopPropagation()}
              style={styles.containerButtons}>
              <View onTouchEnd={onPressCiNom} style={styles.buttons}>
                <Icon
                  size={50}
                  style={{marginBottom: 8, marginTop: 2}}
                  name={IconNoQr}
                  color={'transparent'}
                  fillStroke={cssVar.cWhite}
                />
                <Text style={{color: cssVar.cWhite}}>Sin QR</Text>
              </View>
              <View onTouchEnd={onPressQr} style={styles.buttons}>
                <Icon
                  size={50}
                  name={IconGenericQr}
                  color={cssVar.cWhite}
                  style={{marginBottom: 8}}
                />
                <Text style={{color: cssVar.cWhite}}>Leer QR</Text>
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </PanGestureHandler>
  );
};

export default React.memo(DropdawnAccess);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    backgroundColor: cssVar.cBlack,
    bottom: isIos() ? 68.5 : 72.4,
    borderTopRightRadius: cssVar.bRadius,
    borderTopLeftRadius: cssVar.bRadius,
    borderWidth: 0.5,
    borderBottomWidth: 0,
    borderTopColor: cssVar.cWhiteV1,
  },
  text: {
    color: cssVar.cWhite,
    textAlign: 'center',
    fontFamily: FONTS.medium,
    fontSize: cssVar.sL,
    marginBottom: cssVar.spL,
  },
  containerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  buttons: {
    backgroundColor: cssVar.cBlackV2,
    paddingVertical: cssVar.spL,
    paddingHorizontal: cssVar.spXxl,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: cssVar.bRadius,
  },
});
