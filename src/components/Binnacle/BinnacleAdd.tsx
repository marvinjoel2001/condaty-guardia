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
import UploadImage from '../../../mk/components/forms/UploadImage/UploadImage';
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
          maxLength={250}
          required={true}
          value={formState?.descrip}
          onChange={value => handleInputChange('descrip', value)}
        />
        <UploadImage
          setFormState={setFormState}
          formState={formState}
          label="Adjuntar imagen"
          name="avatar"
        />
      </View>
    </ModalFull>
  );
};

export default BinnacleAdd;
