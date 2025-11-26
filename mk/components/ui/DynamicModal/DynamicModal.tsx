import React from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from '../Icon/Icon';
import {IconX} from '../../../../src/icons/IconLibrary';
import {cssVar, FONTS, TypeStyles} from '../../../styles/themes';
import Button from '../../forms/Button/Button';
import Form from '../../forms/Form/Form';

interface DynamicModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  height?: number;
  style?: TypeStyles;
  subTitle?: string;
  styleHeader?: TypeStyles;
  buttonText?: string;
  onSave?: () => void;
  buttonCancelText?: string;
  variant?: 'V1' | 'V2';
}

const DynamicModal = ({
  open,
  onClose,
  children,
  title,
  height = 660,
  style,
  subTitle,
  styleHeader,
  buttonText = 'Guardar',
  buttonCancelText = 'Cancelar',
  onSave,
  variant = 'V1',
}: DynamicModalProps) => {
  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <SafeAreaView style={{flex: 1}}>
        <Form>
          <View style={styles.overlay}>
            <View
              style={{
                ...styles[`content${variant}`],
                height: height,
                ...style,
              }}>
              <View
                style={{
                  ...styles.header,
                  ...styleHeader,
                }}>
                <View>
                  <Text style={styles.title}>{title}</Text>
                  {subTitle && <Text style={styles.subTitle}>{subTitle}</Text>}
                </View>
                <Icon
                  size={24}
                  name={IconX}
                  onPress={onClose}
                  color={cssVar.cWhite}
                />
              </View>
              <ScrollView style={{padding: 12, flex: 1 }}>{children}</ScrollView>
              <View style={{padding: 12, flexDirection: 'row', gap: 8}}>
                {buttonCancelText && (
                  <Button onPress={onClose} variant="secondary">
                    {buttonCancelText}
                  </Button>
                )}
                {buttonText && (
                  <Button onPress={onSave || (() => {})} variant="primary">
                    {buttonText}
                  </Button>
                )}
              </View>
            </View>
          </View>
        </Form>
      </SafeAreaView>
    </Modal>
  );
};

export default DynamicModal;

const styles: any = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#161616E6',
    justifyContent: 'flex-end',
  },
  contentV1: {
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    backgroundColor: cssVar.cBlackV2,
  },
  contentV2: {
    backgroundColor: '#212121',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#323232',
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: cssVar.cWhiteV1,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: cssVar.cWhite,
  },
  subTitle: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: FONTS.regular,
    color: cssVar.cWhiteV1,
  },
});
