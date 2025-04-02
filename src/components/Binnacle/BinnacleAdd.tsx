import React, {useEffect, useState} from 'react';
import ModalFull from '../../../mk/components/ui/ModalFull/ModalFull';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {TextArea} from '../../../mk/components/forms/TextArea/TextArea';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {uploadImage} from '../../../mk/utils/uploadFile';
import useAuth from '../../../mk/hooks/useAuth';
import {IconScreenShot} from '../../icons/IconLibrary';
import {cssVar} from '../../../mk/styles/themes';
import useApi from '../../../mk/hooks/useApi';
type PropsType = {
  open: boolean;
  onClose: () => void;
  reload: any;
};

const BinnacleAdd = ({open, onClose, reload}: PropsType) => {
  const [errors, setErrors]: any = useState();
  const [formState, setFormState]: any = useState();
  const {showToast} = useAuth();
  const {execute} = useApi();

  const handleInputChange = (name: string, value: any) => {
    const v = value?.target?.value ? value.target.value : value;
    setFormState({
      ...formState,
      [name]: v,
    });
  };
  const onSaveNovedades = async () => {
    if (!formState?.descrip) {
      setErrors({descrip: 'Ingrese una descripcion'});
      return;
    }

    const {data: novedad, error: err} = await execute('/guardnews', 'POST', {
      descrip: formState.descrip,
      imageNew: {file: encodeURIComponent(formState.avatar), ext: 'webp'},
    });
    if (novedad?.success == true) {
      onClose();
      reload();
      setFormState({});
      showToast('Novedad agregada', 'success');
    } else {
      // showToast(err, 'error');
      showToast('Ocurrió un error', 'error');
    }
  };

  return (
    <ModalFull
      open={open}
      title="Nueva bitácora"
      onSave={onSaveNovedades}
      onClose={onClose}
      buttonText="Guardar"
      buttonCancel="">
      <View style={{marginTop: 12}}>
        <TextArea
          label="Descripción"
          name="descrip"
          placeholder="Describe alguna novedad o incidente ocurrido en tu jornada laboral."
          error={errors}
          required={true}
          value={formState?.descrip}
          onChange={value => handleInputChange('descrip', value)}
        />
        <TouchableOpacity
          onPress={() => {
            uploadImage({formState, setFormState, showToast});
          }}
          style={{
            marginVertical: 12,
            paddingVertical: 8,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: cssVar.cBlackV2,
          }}>
          <Icon name={IconScreenShot} color={cssVar.cWhiteV2} />
          <Text
            style={{
              color: cssVar.cWhiteV2,
              fontFamily: 'Poppins Medium',
            }}>
            Subir Imagen
          </Text>
        </TouchableOpacity>
        {formState?.avatar && (
          <View
            style={{
              marginVertical: 16,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              source={{uri: 'data:image/jpg;base64,' + formState.avatar}}
              resizeMode="cover"
              style={{width: 220, height: 290}}
            />
          </View>
        )}
      </View>
    </ModalFull>
  );
};

export default BinnacleAdd;
