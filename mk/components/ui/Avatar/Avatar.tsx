import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {initialsName} from '../../../utils/strings';
import {cssVar, FONTS, ThemeType, TypeStyles} from '../../../styles/themes';
import {IconUser, IconX} from '../../../../src/icons/IconLibrary';
import Icon from '../Icon/Icon';
import {cRandomcolors} from '../../../utils/randomColors';
import {GestureHandlerRootView, GestureDetector, Gesture} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface AvatarProps {
  src?: string | null;
  name?: string;
  w?: number;
  h?: number;
  style?: TypeStyles;
  onClick?: any;
  error?: () => void;
  emptyIcon?: boolean;
  fontSize?: number;
  sizeIconVerify?: number;
  sizeIconDiamond?: number;
  bottomDiamond?: number;
  verify?: boolean;
  level?: any;
  circle?: boolean;
  borderColor?: string;
  borderWidth?: number;
  expandable?: boolean;
}

const Avatar = ({
  src = null,
  name = '',
  w = 40,
  h = 40,
  style = {},
  onClick = null,
  error = () => {},
  emptyIcon = false,
  fontSize = cssVar.sM,
  sizeIconVerify = 16,
  verify = false,
  circle = true,
  borderColor = 'transparent',
  borderWidth = 0,
  expandable = false,
}: AvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

  // Valores compartidos para zoom y pan
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  // Resetear zoom cuando se cierra el modal
  const handleCloseModal = () => {
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    setModalVisible(false);
  };

  const getBackgroundColor = (nameString: string) => {
    if (!nameString || nameString.length === 0) {
        return cRandomcolors[0];
    }
    const index = nameString.length % cRandomcolors.length;
    return cRandomcolors[index];
  };

  const backgroundColor = getBackgroundColor(name);

  const handlePress = () => {
    if (expandable && src && !imageError) {
      setModalVisible(true);
    } else if (onClick) {
      onClick();
    }
  };

  const view = (
    <View style={{alignItems: 'center'}}>
      <TouchableOpacity
        activeOpacity={(onClick || (expandable && src && !imageError)) ? 0.2 : 1}
        style={{
          ...theme.avatar,
          width: w,
          height: h,
          backgroundColor: (src && !imageError) ? 'transparent' : backgroundColor,
          borderColor: borderColor,
          borderWidth: borderWidth,
          borderRadius: circle ? w / 2 : cssVar.bRadiusS,
          ...style,
        }}
        onPress={handlePress}>
        {src && !imageError ? (
          <Image
            source={{uri: src}}
            style={{
              width: w,
              height: h,
              borderRadius: circle ? w / 2 : 0,
            }}
            resizeMode="cover"
            onError={e => {
              error();
              setImageError(true);
            }}
            onLoad={() => {
              setImageError(false);
            }}
          />
        ) : !emptyIcon ? (
          <Text style={{...theme.text, fontSize: fontSize}}>
            {initialsName(name)}
          </Text>
        ) : (
          <Icon
            name={IconUser}
            color={cssVar.cBlackV2}
            fillStroke={cssVar.cBlackV2}
            size={w - 8}
          />
        )}
      </TouchableOpacity>
    </View>
  );

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
    <View style={theme.container}>
      {view}
      {expandable && src && !imageError && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseModal}>
          <GestureHandlerRootView style={modalStyles.modalOverlay}>
            <View style={modalStyles.modalContent}>
              {/* Botón de cerrar */}
              <TouchableOpacity
                style={modalStyles.closeButton}
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
                  source={{uri: src}}
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
              <View style={modalStyles.zoomIndicator}>
                <Text style={modalStyles.zoomText}>
                  Pellizca para hacer zoom
                </Text>
              </View>
            </View>
          </GestureHandlerRootView>
        </Modal>
      )}
    </View>
  );
};

export default Avatar;

const theme: ThemeType = {
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: cssVar.cBlackV1,
    fontSize: cssVar.sM,
    fontFamily: FONTS.bold,
  },
};

const modalStyles = StyleSheet.create({
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