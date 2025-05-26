import React, {useEffect, useRef} from 'react';
import {Text, View, Animated, Easing, TouchableOpacity, StyleSheet} from 'react-native'; // Added TouchableOpacity, StyleSheet
import Icon from '../Icon/Icon';
import {
  IconX,
  IconSuccessToast,
  IconInfoToast,
  // Assuming you might have specific icons for error/warning or will reuse IconInfoToast/IconX
} from '../../../../src/icons/IconLibrary'; // Adjust path as needed
import {cssVar, FONTS, ThemeType} from '../../../styles/themes'; // Adjust path as needed

type toastProps = {
  msg: string | null;
  type: 'success' | 'error' | 'warning' | 'info';
  time?: number;
  important?: boolean;
  title?: string; // Added optional title prop
};

interface ToastProps {
  toast: toastProps;
  showToast: (param: string) => void; // Assuming this clears the toast by setting msg to '' or null
}

export const TIME_TOAST = 3000;

const Toast = ({toast, showToast}: ToastProps) => {
  const translateY = useRef(new Animated.Value(-200)).current;

  const _close = () => {
    Animated.timing(translateY, {
      toValue: -200,
      duration: 400,
      easing: Easing.ease,
      useNativeDriver: true, // Native driver is good for transform animations
    }).start(() => {
      if (toast?.msg) { // Ensure showToast is called only if there was a message
        showToast(''); // Clear the toast message
      }
    });
  };

  useEffect(() => {
    if (toast?.msg) {
      Animated.timing(translateY, {
        toValue: 0, // Target position (depends on how theme.container positions it)
        duration: 800, // Slower animation as per original
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        _close();
      }, toast?.time || TIME_TOAST);
      return () => clearTimeout(timer); // Cleanup timer
    } else {
      // If toast.msg becomes null/empty (e.g. from parent), ensure it's hidden
      // This might be redundant if _close() is always called, but good for safety
      translateY.setValue(-200);
    }
  }, [toast?.msg, toast?.time]); // Added toast.time to dependencies

  const getIconAndColor = () => {
    switch (toast?.type) {
      case 'success':
        return {icon: IconSuccessToast, color: '#34a853', defaultTitle: '¡Excelente!'};
      case 'error':
        return {icon: IconX, color: cssVar.cError, defaultTitle: 'Error'}; // Keep your error color
      case 'warning':
        return {icon: IconInfoToast, color: cssVar.cWarning, style: {transform: [{scaleY: -1}]}, defaultTitle: 'Advertencia'}; // Keep your warning color
      case 'info':
        return {icon: IconInfoToast, color: cssVar.cInfo, defaultTitle: 'Información'}; // Keep your info color
      default:
        return {icon: IconInfoToast, color: cssVar.cBlack, defaultTitle: 'Mensaje'};
    }
  };

  const {icon, color, style: iconStyle, defaultTitle} = getIconAndColor();
  const currentTitle = toast?.title || defaultTitle;

  if (!toast?.msg) {
    return null; // Don't render anything if there's no message
  }

  return (
    // This View handles the absolute positioning and centering of the toast
    <View style={styles.outerContainer}>
      <Animated.View
        style={[
          styles.toastAnimatedContainer,
          {transform: [{translateY}]}, // Apply animation here
        ]}>
        {/* Status Icon */}
        <View style={styles.statusIconWrapper}>
          <Icon name={icon} color={color} style={iconStyle} size={28} />
        </View>

        {/* Text Content (Title and Message) */}
        <View style={styles.textContentWrapper}>
          <Text style={styles.titleText}>{currentTitle}</Text>
          <Text style={styles.messageText}>{toast.msg}</Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity onPress={_close} style={styles.closeButtonWrapper}>
          <Icon name={IconX} size={12} color={cssVar.cBlackV2 || cssVar.cBlack} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default Toast;

// Styles
const styles = StyleSheet.create({
  outerContainer: { // Corresponds to old theme.container
    position: 'absolute',
    top: 50, // Or your desired vertical position
    left: 0,
    right: 0,
    alignItems: 'center', // Centers the toast horizontally
    zIndex: 1000,
  },
  toastAnimatedContainer: { // Corresponds to old theme.visible and new HTML structure
    width: 320, // w-80
    height: 72, // h-[72px]
    flexDirection: 'row',
    alignItems: 'center', // Vertically align items within the toast
    backgroundColor: cssVar.cWhite,
    borderRadius: 10,
    paddingHorizontal: 16, // Provides space at the sides
    paddingVertical: 10, // Adjust to vertically center content within 72px height
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    pointerEvents: 'box-only', // From original
  },
  statusIconWrapper: {
    marginRight: 12, // Space between status icon and text content
    // Icon size is set directly on <Icon />
  },
  textContentWrapper: {
    flex: 1, // Allows text content to take available space
    flexDirection: 'column',
    justifyContent: 'center', // To help center title+message block vertically if it's shorter than icon
    // gap: 4, // For spacing between title and message, use margin instead for wider compatibility
  },
  titleText: {
    fontFamily: FONTS.semiBold, // font-semibold
    fontSize: 14, // text-[14px]
    color: cssVar.cBlack, // Assuming light background
    marginBottom: 4, // Simulates gap-1 from HTML structure (space between title and message)
  },
  messageText: {
    fontFamily: FONTS.regular, // font-normal
    fontSize: 12, // text-[12px]
    color: cssVar.cBlack, // Assuming light background
    flexShrink: 1, // Allow message to shrink and wrap if needed
  },
  closeButtonWrapper: {
    width: 24, // w-5 (20px) from HTML, increased touch area
    height: 24, // h-5 (20px) from HTML, increased touch area
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12, // Space between text content and close button
    padding: 4, // Make touch area slightly bigger than icon
  },
});