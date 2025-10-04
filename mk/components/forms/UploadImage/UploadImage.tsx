import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {cssVar, TypeStyles} from '../../../styles/themes';
import Icon from '../../ui/Icon/Icon';
import {IconGallery, IconX} from '../../../../src/icons/IconLibrary';
import {uploadImage} from '../../../utils/uploadFile';
import useAuth from '../../../hooks/useAuth';
interface PropsType {
  formState: any;
  setFormState: any;
  label: string;
  name: string;
  style?: TypeStyles;
}

const UploadImage = ({
  formState,
  setFormState,
  label,
  name,
  style,
}: PropsType) => {
  const {showToast} = useAuth();
  return (
    <View
      style={{
        width: '100%',
        height: 180,
        backgroundColor: cssVar.cWhiteV2,
        borderRadius: 12,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
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
          <Image
            source={{
              uri: 'data:image/jpg;base64,' + formState?.[name],
            }}
            resizeMode="contain"
            style={{width: '100%', height: '100%', borderRadius: 12}}
          />
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
    </View>
  );
};

export default UploadImage;
