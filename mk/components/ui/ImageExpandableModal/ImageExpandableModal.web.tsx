import React, {useEffect, useState} from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
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
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

  useEffect(() => {
    if (visible) {
      const total = images && images.length ? images.length : imageUri ? 1 : 0;
      let idx = initialIndex || 0;
      if (idx < 0) idx = 0;
      if (total > 0 && idx > total - 1) idx = total - 1;
      setCurrentIndex(idx);
    }
  }, [visible, initialIndex, images, imageUri]);

  const handleCloseModal = () => {
    onClose();
  };

  const handlePrev = () => {
    if (images && images.length > 1 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (images && images.length > 1 && currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

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
      <View style={styles.modalOverlay}>
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
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setCurrentIndex(idx)}
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

          <View style={styles.imageContainer}>
            {/* Left arrow for web navigation */}
            {images && images.length > 1 && currentIndex > 0 && (
               <TouchableOpacity style={[styles.navButton, styles.navButtonLeft]} onPress={handlePrev}>
                 <Text style={styles.navText}>{'<'}</Text>
               </TouchableOpacity>
            )}

            <Image
              source={{uri: currentUri}}
              style={{
                width: screenWidth * 0.9,
                height: screenHeight * 0.9,
              }}
              resizeMode="contain"
            />

            {/* Right arrow for web navigation */}
            {images && images.length > 1 && currentIndex < images.length - 1 && (
               <TouchableOpacity style={[styles.navButton, styles.navButtonRight]} onPress={handleNext}>
                 <Text style={styles.navText}>{'>'}</Text>
               </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
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
    cursor: 'pointer', // web only
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
    cursor: 'pointer', // web only
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
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButton: {
    position: 'absolute',
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  navButtonLeft: {
    left: 10,
  },
  navButtonRight: {
    right: 10,
  },
  navText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
