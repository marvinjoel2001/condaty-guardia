import React, {useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {cssVar, TypeStyles} from '../../../styles/themes';
import Icon from '../../ui/Icon/Icon';
import {IconGallery, IconX} from '../../../../src/icons/IconLibrary';
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
}

const UploadImage = ({
  formState,
  setFormState,
  label,
  name,
  style,
  expandable = false,
  variant = 'V1',
}: PropsType) => {
  const {showToast} = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const imageUri = formState?.[name]
    ? 'data:image/jpg;base64,' + formState?.[name]
    : '';

  return (
    <View
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
          <Icon
            name={IconGallery}
            fillStroke={cssVar.cWhite}
            color={'transparent'}
          />
          <Text
            onPress={() => uploadImage({formState, setFormState, showToast})}
            style={{
              color: cssVar.cAccent,
              textDecorationLine: 'underline',
              fontSize: 12,
            }}>
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
    </View>
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
});
