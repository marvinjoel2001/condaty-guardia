import React, {useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {cssVar, FONTS, TypeStyles} from '../../../styles/themes';
import Icon from '../../ui/Icon/Icon';
import {
  IconCamera,
  IconGallery,
  IconX,
} from '../../../../src/icons/IconLibrary';
import {uploadImage} from '../../../utils/uploadFile';
import useAuth from '../../../hooks/useAuth';
import ImageExpandableModal from '../../ui/ImageExpandableModal/ImageExpandableModal';
interface PropsType {
  formState: any;
  setFormState: any;
  label: string;
  name: string;
  style?: TypeStyles;
  expandable?: boolean;
  variant?: 'V1' | 'V2';
  formatted?: boolean;
}

const UploadImage = ({
  formState,
  setFormState,
  label,
  name,
  style,
  expandable = false,
  variant = 'V1',
  formatted = false,
}: PropsType) => {
  const {showToast} = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  // const imageUri = formState?.[name]
  //   ? 'data:image/jpg;base64,' + formState?.[name]
  //   : '';

  let imageUri = '';
  if (formatted && formState?.[name]?.file) {
    imageUri = 'data:image/jpg;base64,' + formState?.[name].file;
  } else if (formState?.[name]) {
    imageUri = 'data:image/jpg;base64,' + formState?.[name];
  }

  return (
    <TouchableOpacity
      onPress={() =>
        uploadImage({formState, setFormState, showToast, name, formatted})
      }
      style={{
        ...styles['container' + variant],
        ...style,
      }}>
      {formState?.[name] ? (
        <>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setFormState({...formState, [name]: null})}
            style={{
              position: 'absolute',
              zIndex: 2,
              right: 4,
              top: 2,
              backgroundColor: cssVar.cBlackV1,
              padding: 4,
              borderRadius: 8,
            }}>
            <Icon name={IconX} color={cssVar.cWhiteV1} size={16} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={expandable ? 0.7 : 1}
            onPress={() => expandable && setModalVisible(true)}
            style={{width: '100%', height: '100%'}}>
            <Image
              source={{
                uri: imageUri,
              }}
              resizeMode="contain"
              style={{width: '100%', height: '100%', borderRadius: 12}}
            />
          </TouchableOpacity>
        </>
      ) : (
        <>
          {variant === 'V1' && (
            <Icon
              name={IconGallery}
              fillStroke={cssVar.cWhite}
              color={'transparent'}
            />
          )}
          {variant === 'V2' && (
            <Icon
              name={IconCamera}
              fillStroke={cssVar.cAccent}
              color={'transparent'}
            />
          )}
          <Text
            onPress={() =>
              uploadImage({formState, setFormState, showToast, name, formatted})
            }
            style={styles['label' + variant]}>
            {label || 'Subir comprobante'}
          </Text>
        </>
      )}

      {expandable && !!imageUri && (
        <ImageExpandableModal
          visible={modalVisible}
          imageUri={imageUri}
          onClose={() => setModalVisible(false)}
        />
      )}
    </TouchableOpacity>
  );
};

export default UploadImage;

const styles: any = StyleSheet.create({
  containerV1: {
    width: '100%',
    height: 180,
    backgroundColor: cssVar.cWhiteV2,
    borderRadius: 12,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  containerV2: {
    borderWidth: 2,
    borderColor: '#414141',
    borderStyle: 'dashed',
    height: 100,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelV1: {
    color: cssVar.cAccent,
    textDecorationLine: 'underline',
    fontSize: 12,
  },
  labelV2: {
    color: cssVar.cWhiteV1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginTop: 8,
  },
});
