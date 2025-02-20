import {BlurView} from '@react-native-community/blur';
import {useEffect, useRef} from 'react';
import {Animated, Easing, Modal, StyleSheet, Text, View} from 'react-native';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {getUrlImages} from '../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import Button from '../../../mk/components/forms/Button/Button';
import React from 'react';

interface PropsType {
  id: string;
  prefijo: string;
  updated_at?: string;
  name: string;
  open: boolean;
  onClose: () => void;

  w?: number;
  h?: number;
}

const AvatarPreview = ({
  id,
  prefijo,
  updated_at,
  name,
  open,
  onClose,
  w,
  h,
}: PropsType) => {
  const opacity = useRef(new Animated.Value(0)).current;

  const closeImage = () => {
    _onClose();
  };

  const openImage = () => {
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (open) {
      openImage();
      // checkURLStatus();
    } else {
      closeImage();
    }
  }, [open]);

  const _onClose = () => {
    onClose();
  };
  // console.log(getUrlImages(`/${prefijo}-${id}.png?d=${updated_at}`));

  return (
    <>
      {open && (
        <Modal animationType="fade" transparent={true} visible={open}>
          <View
            style={{backgroundColor: 'rgba(0, 0, 0, 0.8)', ...styles.absolute}}>
            {/* <BlurView
            style={styles.absolute}
            blurType="dark"
            blurAmount={8}
            reducedTransparencyFallbackColor="white"> */}
            <Animated.View
              onTouchEnd={closeImage}
              style={[styles.animatedContainer]}>
              <Avatar
                src={getUrlImages(`/${prefijo}-${id}.png?d=${updated_at}`)}
                w={w || 240}
                h={h || 240}
                name={name}
                // sizeIconVerify={58}
                fontSize={48}
              />
            </Animated.View>
            {/* </BlurView> */}
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  animatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AvatarPreview;
