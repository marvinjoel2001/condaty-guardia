import {useEffect, useRef} from 'react';
import {Animated, Easing, Modal, StyleSheet, View} from 'react-native';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import {getUrlImages} from '../../../mk/utils/strings';
import React from 'react';

interface PropsType {
  id: string;
  prefijo: string;
  updated_at?: string;
  name: string;
  open: boolean;
  onClose: () => void;
  hasImage: number;
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
  hasImage,
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

  return (
    <>
      {open && (
        <Modal animationType="fade" transparent={true} visible={open}>
          <View
            style={{backgroundColor: 'rgba(0, 0, 0, 0.8)', ...styles.absolute}}>
            <Animated.View
              onTouchEnd={closeImage}
              style={[styles.animatedContainer]}>
              <Avatar
                hasImage={hasImage}
                src={getUrlImages(`/${prefijo}-${id}.webp?d=${updated_at}`)}
                w={w || 240}
                h={h || 240}
                name={name}
                fontSize={48}
              />
            </Animated.View>
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
