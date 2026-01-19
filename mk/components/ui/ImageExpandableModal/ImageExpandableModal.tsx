import React, {useEffect, useState} from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {runOnJS} from 'react-native-reanimated';
import {cssVar, FONTS} from '../../../styles/themes';
import Icon from '../Icon/Icon';
import {IconX} from '../../../../src/icons/IconLibrary';

interface ImageExpandableModalProps {
  visible: boolean;
  imageUri?: string;
  images?: string[];
  initialIndex?: number;
  onClose: () => void;
}

const ImageExpandableModal = ({
  visible,
  imageUri,
  images,
  initialIndex = 0,
  onClose,
}: ImageExpandableModalProps) => {
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');
  const containerWidth = screenWidth * 0.9;
  const containerHeight = screenHeight * 0.9;

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
  const currentIndexSV = useSharedValue(currentIndex);

  useEffect(() => {
    currentIndexSV.value = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (visible) {
      scale.value = 1;
      savedScale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      const total = images && images.length ? images.length : imageUri ? 1 : 0;
      let idx = initialIndex || 0;
      if (idx < 0) idx = 0;
      if (total > 0 && idx > total - 1) idx = total - 1;
      setCurrentIndex(idx);
      currentIndexSV.value = idx;
    }
  }, [visible, initialIndex, images, imageUri]);

  const handleCloseModal = () => {
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    if (images && images.length) {
      setCurrentIndex(0);
      currentIndexSV.value = 0;
    }
    onClose();
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate(event => {
      const next = savedScale.value * event.scale;
      const s = Math.max(1, Math.min(next, 5));
      scale.value = s;
      if (s <= 1) {
        translateX.value = 0;
        translateY.value = 0;
      }
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withTiming(1, {duration: 300});
        savedScale.value = 1;
        translateX.value = withTiming(0, {duration: 300});
        translateY.value = withTiming(0, {duration: 300});
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else if (scale.value > 5) {
        scale.value = withTiming(5, {duration: 300});
        savedScale.value = 5;
      } else {
        savedScale.value = scale.value;
        const bx = (containerWidth * (scale.value - 1)) / 2;
        const by = (containerHeight * (scale.value - 1)) / 2;
        const clampX = Math.max(-bx, Math.min(translateX.value, bx));
        const clampY = Math.max(-by, Math.min(translateY.value, by));
        translateX.value = withTiming(clampX, {duration: 300});
        translateY.value = withTiming(clampY, {duration: 300});
        savedTranslateX.value = clampX;
        savedTranslateY.value = clampY;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      if (scale.value > 1) {
        const bx = (containerWidth * (scale.value - 1)) / 2;
        const by = (containerHeight * (scale.value - 1)) / 2;
        const nx = savedTranslateX.value + event.translationX;
        const ny = savedTranslateY.value + event.translationY;
        translateX.value = Math.max(-bx, Math.min(nx, bx));
        translateY.value = Math.max(-by, Math.min(ny, by));
      } else {
        translateX.value = 0;
        translateY.value = 0;
      }
    })
    .onEnd(event => {
      if (scale.value > 1) {
        const bx = (containerWidth * (scale.value - 1)) / 2;
        const by = (containerHeight * (scale.value - 1)) / 2;
        const clampX = Math.max(-bx, Math.min(translateX.value, bx));
        const clampY = Math.max(-by, Math.min(translateY.value, by));
        translateX.value = withTiming(clampX, {duration: 300});
        translateY.value = withTiming(clampY, {duration: 300});
        savedTranslateX.value = clampX;
        savedTranslateY.value = clampY;
      } else {
        if (images && images.length) {
          const threshold = 40;
          if (event.translationX > threshold && currentIndexSV.value > 0) {
            const next = currentIndexSV.value - 1;
            currentIndexSV.value = next;
            runOnJS(setCurrentIndex)(next);
          } else if (
            event.translationX < -threshold &&
            currentIndexSV.value < images.length - 1
          ) {
            const next = currentIndexSV.value + 1;
            currentIndexSV.value = next;
            runOnJS(setCurrentIndex)(next);
          }
        }
        translateX.value = withTiming(0, {duration: 300});
        translateY.value = withTiming(0, {duration: 300});
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (savedScale.value <= 1) {
        scale.value = withTiming(2, {duration: 300});
        savedScale.value = 2;
        translateX.value = withTiming(0, {duration: 300});
        translateY.value = withTiming(0, {duration: 300});
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withTiming(1, {duration: 300});
        savedScale.value = 1;
        translateX.value = withTiming(0, {duration: 300});
        translateY.value = withTiming(0, {duration: 300});
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const composed = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture,
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
      {scale: scale.value},
    ],
  }));

  const currentUri =
    images && images.length
      ? images[Math.max(0, Math.min(currentIndex, images.length - 1))]
      : imageUri || '';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCloseModal}>
      <GestureHandlerRootView style={styles.modalOverlay}>
        <View style={styles.modalContent}>
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
          {images && images.length > 0 && (
            <View style={styles.topIndicators}>
              <View style={styles.dotsRow}>
                {images.map((_, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      currentIndex === idx ? styles.dotActive : {},
                    ]}
                  />
                ))}
              </View>
              <View style={styles.counterBadge}>
                <Text style={styles.counterText}>{`${currentIndex + 1}/${
                  images.length
                }`}</Text>
              </View>
            </View>
          )}
          <GestureDetector gesture={composed}>
            <Animated.Image
              source={{uri: currentUri}}
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
          <View style={styles.zoomIndicator}>
            <Text style={styles.zoomText}>Pellizca para hacer zoom</Text>
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
  topIndicators: {
    position: 'absolute',
    top: 76,
    left: 0,
    right: 0,
    zIndex: 900,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 16,
    backgroundColor: cssVar.cWhite,
  },
  counterBadge: {
    position: 'absolute',
    left: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  counterText: {
    color: cssVar.cWhiteV1,
    fontSize: cssVar.sS,
    fontFamily: FONTS.regular,
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
