import React from 'react';
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import ModalRN from 'react-native-modal';

import Icon from '../Icon/Icon';
import { cssVar, FONTS } from '../../../styles/themes';
import { IconX } from '../../../../src/icons/IconLibrary';
import Button from '../../forms/Button/Button';

type Props = {
  children: React.ReactNode;
  onClose: (reason: 'x' | 'overlay' | 'cancel') => void;
  open: boolean;
  onSave?: (id?: string) => void;
  title?: string;
  buttonText?: string;
  buttonCancel?: string;
  buttonExtra?: React.ReactNode;
  id?: string;
  iconClose?: boolean;
  disabled?: boolean;
  headerStyles?: object;
  containerStyles?: object;
  overlayClose?: boolean; // permite cerrar tocando fuera
};

const Modal = React.memo(
  ({
    children,
    onClose,
    open,
    onSave = () => {},
    title = '',
    buttonText = '',
    buttonCancel = '',
    buttonExtra = null,
    id = '',
    iconClose = true,
    disabled = false,
    headerStyles = {},
    containerStyles = {},
    overlayClose = false,
  }: Props) => {
    const screenWidth = Dimensions.get('window').width;

    const handleBackdropPress = () => {
      if (overlayClose) onClose('overlay');
    };

    const handleClose = (reason: 'x' | 'cancel') => {
      onClose(reason);
    };

    return (
      <ModalRN
        isVisible={open}
        onBackdropPress={handleBackdropPress}
        onBackButtonPress={() => handleClose('x')}
        backdropOpacity={0.65}
        backdropColor="#161616"
        animationIn="fadeIn"
        animationOut="fadeOut"
        style={styles.modal}
        propagateSwipe // permite swipe en ScrollView interno
      >
        {open && (
          <View style={styles.contentWrapper}>
            <View
              style={[
                styles.container,
                containerStyles,
                { width: screenWidth - 24 },
              ]}
            >
              {(iconClose || title) && (
                <View style={[styles.header, headerStyles]}>
                  {title && (
                    <View style={styles.titleContainer}>
                      <Text style={styles.headerText} numberOfLines={1}>
                        {title}
                      </Text>
                    </View>
                  )}
                  {iconClose && (
                    <TouchableOpacity onPress={() => handleClose('x')}>
                      <Icon name={IconX} color={cssVar.cWhite} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <ScrollView
                style={styles.body}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>

              {(buttonText || buttonCancel || buttonExtra) && (
                <View style={styles.footer}>
                  <View style={styles.footerButtons}>
                    {buttonText && (
                      <Button
                        variant="primary"
                        disabled={disabled}
                        onPress={() => onSave(id)}
                      >
                        {buttonText}
                      </Button>
                    )}
                    {buttonCancel && (
                      <Button
                        variant="secondary"
                        onPress={() => handleClose('cancel')}
                      >
                        {buttonCancel}
                      </Button>
                    )}
                  </View>
                  {buttonExtra && buttonExtra}
                </View>
              )}
            </View>
          </View>
        )}
      </ModalRN>
    );
  },
);

export default Modal;

// Estilos con StyleSheet para referencias estables
const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: cssVar.cBlack,
    borderRadius: cssVar.bRadiusS,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 10,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomColor: cssVar.cWhiteV1,
    borderBottomWidth: 0.5,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 12,
  },
  headerText: {
    color: cssVar.cWhite,
    fontSize: cssVar.sL,
    fontFamily: FONTS.semiBold,
  },
  body: {
    paddingHorizontal: cssVar.spM,
    paddingVertical: cssVar.spM,
  },
  footer: {
    padding: cssVar.spS,
    borderTopColor: cssVar.cWhiteV1,
    borderTopWidth: 0.5,
  },
  footerButtons: {
    flexDirection: 'row-reverse',
    gap: cssVar.spS,
    justifyContent: 'flex-end',
  },
});
