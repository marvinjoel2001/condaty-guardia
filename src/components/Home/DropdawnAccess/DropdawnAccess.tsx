import React, { useState, useCallback } from 'react';
import { Text, View, Dimensions, StyleSheet } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { cssVar, FONTS } from '../../../../mk/styles/themes';
import Icon from '../../../../mk/components/ui/Icon/Icon';
import {
  IconArrowDown,
  IconArrowUp,
  IconGenericQr,
  IconNoQr,
} from '../../../icons/IconLibrary';
import { isIos } from '../../../../mk/utils/utils';

const CLOSED_HEIGHT = 0;
const OPEN_HEIGHT = 244;

type PropsType = {
  onPressQr: () => void;
  onPressCiNom: () => void;
};

const DropdawnAccess = ({ onPressQr, onPressCiNom }: PropsType) => {
  const [openDrop, setOpenDrop] = useState(false);
  // El dropdown se abre/cierra instantáneamente, sin animación ni delay
  const height = openDrop ? OPEN_HEIGHT : CLOSED_HEIGHT;
  const animatedStyle = { height };

  // open y close ya no son necesarios, se usa toggleDropdown directamente

  const toggleDropdown = useCallback(() => {
    setOpenDrop(prev => !prev);
  }, []);

  const handlePanGesture = useCallback(
    ({ nativeEvent }: any) => {
      if (nativeEvent.translationY < -10 && !openDrop) {
        setOpenDrop(true);
      } else if (nativeEvent.translationY > 10 && openDrop) {
        setOpenDrop(false);
      }
    },
    [openDrop],
  );

  return (
    <PanGestureHandler onGestureEvent={handlePanGesture}>
      <View
        style={[
          styles.container,
          {
            bottom: openDrop ? 32.4 : 68.5,
            borderTopRightRadius: openDrop ? cssVar.bRadius : 0,
            borderTopLeftRadius: openDrop ? cssVar.bRadius : 0,
            borderWidth: openDrop ? 0.5 : 0,
            borderBottomWidth: openDrop ? 0.5 : 0,
          },
          animatedStyle,
        ]}
      >
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
          }}
        >
          <Icon
            style={{ marginTop: 2 }}
            name={openDrop ? IconArrowDown : IconArrowUp}
            color={cssVar.cWhite}
          />
        </View>

        {openDrop && (
          <>
            <Text style={{ ...styles.text, marginTop: 20 }}>
              Permitir ingreso
            </Text>
            <View
              onTouchEnd={e => e.stopPropagation()}
              style={styles.containerButtons}
            >
              <View onTouchEnd={onPressCiNom} style={styles.buttons}>
                <Icon
                  size={50}
                  style={{ marginBottom: 8, marginTop: 2 }}
                  name={IconNoQr}
                  color={'transparent'}
                  fillStroke={cssVar.cWhite}
                />
                <Text style={{ color: cssVar.cWhite }}>Sin QR</Text>
              </View>
              <View onTouchEnd={onPressQr} style={styles.buttons}>
                <Icon
                  size={50}
                  name={IconGenericQr}
                  color={cssVar.cWhite}
                  style={{ marginBottom: 8 }}
                />
                <Text style={{ color: cssVar.cWhite }}>Leer QR</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </PanGestureHandler>
  );
};

export default React.memo(DropdawnAccess);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    backgroundColor: cssVar.cBlack,
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
