import React, { useState} from 'react';
import ModalFull from '../../../mk/components/ui/ModalFull/ModalFull';
import {TextArea} from '../../../mk/components/forms/TextArea/TextArea';
import useAuth from '../../../mk/hooks/useAuth';
import useApi from '../../../mk/hooks/useApi';
import UploadFile from '../../../mk/components/forms/UploadFileV2';
import { View } from 'react-native';
type PropsType = {
  open: boolean;
  onClose: () => void;
  reload: any;
};

const BinnacleAdd = ({ open, onClose, reload }: PropsType) => {
  const [errors, setErrors]: any = useState({});
  
  // ← LA LÍNEA QUE ARREGLA TODO
  const [formState, setFormState]: any = useState({
    descrip: ''  });

  const { showToast, user } = useAuth();
  const { execute } = useApi();
  const clientId = user?.client_id || user?.clientId || 'unknown';
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

    const {data: novedad} = await execute('/guardnews', 'POST', formState);
    if (novedad?.success) {
      onClose();
      reload();
      setFormState({ descrip: '', image_path: '' });
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
      <View style={{ flex: 1, padding: 12, gap: 16 }}>
        
        <View style={{ marginBottom: 16, flex:  1, maxHeight: 200 }}>
        <UploadFile
          setFormState={setFormState}
          formState={formState}
          name="images"
          label="Adjuntar imagen"
          type="I"
          cant={5}
          clientId={clientId}
          prefix="guards/novedades"
          variant='V2'
        />
        </View>
        <TextArea
          type="textArea"
          label="Escribir reporte..."
          name="descrip"
          error={errors}
          maxLength={5000}
          required={false}
          value={formState?.descrip || ''}
          onChange={(value) => handleInputChange('descrip', value)}
          expandable={true}
        />
      </View>
    </ModalFull>
  );
};

export default BinnacleAdd;