import React, { useState} from 'react';
import ModalFull from '../../../mk/components/ui/ModalFull/ModalFull';
import {TextArea} from '../../../mk/components/forms/TextArea/TextArea';
import useAuth from '../../../mk/hooks/useAuth';
import useApi from '../../../mk/hooks/useApi';
import UploadImage from '../../../mk/components/forms/UploadImage/UploadImage';
import { View } from 'react-native';
type PropsType = {
  open: boolean;
  onClose: () => void;
  reload: any;
};

const BinnacleAdd = ({open, onClose, reload}: PropsType) => {
  const [errors, setErrors]: any = useState({});
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

    const hasImage =
      typeof formState?.avatar === 'string' &&
      formState.avatar.trim() !== '' &&
      formState.avatar !== 'undefined';

    const payload: any = {
      descrip: formState.descrip,
    };

    if (hasImage) {
      payload.imageNew = {
        file: encodeURIComponent(formState.avatar),
        ext: 'webp',
      };
    }

    const {data: novedad} = await execute('/guardnews', 'POST', payload);
    if (novedad?.success) {
      onClose();
      reload();
      setFormState({});
      showToast('Novedad agregada', 'success');
    } else {
      showToast('Ocurrió un error', 'error');
    }
  };

  return (
    <ModalFull
      open={open}
      title="Nuevo reporte"
      onSave={onSaveNovedades}
      onClose={onClose}
      buttonText="Enviar reporte"
      buttonCancel=""
      scrollViewHide={true}
    >
      <View style={{flex: 1, padding: 12}}>
        <TextArea
          type="textArea"
          label="Escribir reporte..."
          name="descrip"
          error={errors}
          maxLength={5000}
          required={false}
          value={formState?.descrip}
          onChange={value => handleInputChange('descrip', value)}
          expandable={true}
        />

        <UploadImage
          style={{
            marginTop: 12,
            ...(formState?.avatar ? {flex: 1} : {maxHeight: 157}),
          }}
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
