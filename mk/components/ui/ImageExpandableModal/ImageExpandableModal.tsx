import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import {GestureHandlerRootView, GestureDetector, Gesture} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {cssVar, FONTS} from '../../../styles/themes';
import Icon from '../Icon/Icon';
import {IconX} from '../../../../src/icons/IconLibrary';

interface ImageExpandableModalProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

const ImageExpandableModal = ({
  visible,
  imageUri,
  onClose,
}: ImageExpandableModalProps) => {
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

  // Valores compartidos para zoom y pan
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Resetear zoom cuando se cierra el modal
  const handleCloseModal = () => {
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    onClose();
  };

  // Gestos de pinch y pan
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      // Limitar zoom entre 1x y 5x
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else if (scale.value > 5) {
        scale.value = withSpring(5);
        savedScale.value = 5;
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
      {scale: scale.value},
    ],
  }));

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCloseModal}>
      <GestureHandlerRootView style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Botón de cerrar */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseModal}
            activeOpacity={0.7}>
            <Icon
              name={IconX}
              color={cssVar.cWhite}
              fillStroke={cssVar.cWhite}
              size={28}
            />
          </TouchableOpacity>

          {/* Imagen con zoom */}
          <GestureDetector gesture={composed}>
            <Animated.Image
              source={{uri: imageUri}}
              style={[
                {
                  width: screenWidth * 0.9,
                  height: screenHeight * 0.9,
                },
                animatedStyle,
              ]}
              resizeMode="contain"
            />
          </GestureDetector>

          {/* Indicador de zoom */}
          <View style={styles.zoomIndicator}>
            <Text style={styles.zoomText}>
              Pellizca para hacer zoom
            </Text>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default ImageExpandableModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    padding: 12,
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomIndicator: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  zoomText: {
    color: cssVar.cWhite,
    fontSize: cssVar.sS,
    fontFamily: FONTS.regular,
  },
});
